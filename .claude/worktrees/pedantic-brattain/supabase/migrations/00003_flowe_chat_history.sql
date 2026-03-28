-- ============================================================================
-- Migration: FlowE Chat History Tables
-- Description: Stores FlowE assistant conversation history for persistent
--              chat sessions across user visits.
-- ============================================================================

-- Conversations table — groups messages into sessions
CREATE TABLE IF NOT EXISTS flowe_conversations (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT 'New conversation',
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Messages table — individual chat messages
CREATE TABLE IF NOT EXISTS flowe_messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES flowe_conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         TEXT NOT NULL,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_flowe_conversations_user_id
  ON flowe_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_flowe_conversations_updated_at
  ON flowe_conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_flowe_messages_conversation_id
  ON flowe_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_flowe_messages_created_at
  ON flowe_messages(created_at);

-- Row-level security: users can only see their own conversations
ALTER TABLE flowe_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowe_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON flowe_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON flowe_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON flowe_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON flowe_conversations
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in their conversations"
  ON flowe_messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert messages in their conversations"
  ON flowe_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Auto-update the updated_at timestamp on conversations when new messages arrive
CREATE OR REPLACE FUNCTION update_flowe_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE flowe_conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_flowe_message_update_conversation
  AFTER INSERT ON flowe_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_flowe_conversation_timestamp();
