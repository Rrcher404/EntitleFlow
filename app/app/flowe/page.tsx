'use client';

import { useState, useCallback, useEffect, useRef, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import {
  CornerDownLeft,
  Sparkles,
  Zap,
  Plus,
  MessageSquare,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  model?: {
    provider: string;
    model: string;
  };
  suggestedAgent?: {
    id: string;
    name: string;
    reason: string;
  };
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// FlowE Full Page
// ---------------------------------------------------------------------------

export default function FlowEPage() {
  const pathname = usePathname();

  // Conversation list state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // Active conversation state
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation list on mount
  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      setLoadingConversations(true);
      const response = await fetch('/api/ai/chat');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('[FlowE] Failed to load conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  }

  async function loadConversation(conversationId: string) {
    try {
      const response = await fetch(`/api/ai/chat?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        const loaded: ChatMessage[] = (data.messages || []).map(
          (m: { id: string; role: string; content: string; metadata?: Record<string, unknown>; created_at: string }) => ({
            id: m.id,
            content: m.content,
            role: m.role as 'user' | 'assistant',
            timestamp: m.created_at,
            model: m.metadata?.model as ChatMessage['model'] | undefined,
            suggestedAgent: m.metadata?.suggestedAgent as ChatMessage['suggestedAgent'] | undefined,
          }),
        );
        setMessages(loaded);
        setActiveConversationId(conversationId);
      }
    } catch (error) {
      console.error('[FlowE] Failed to load conversation:', error);
    }
  }

  function startNewConversation() {
    setActiveConversationId(null);
    setMessages([
      {
        id: 'welcome',
        content:
          "Hey! I'm FlowE, your EntitleFlow assistant. I can help you navigate the platform, answer questions about your projects and permits, or explain NC building codes and jurisdiction requirements. What can I help with?",
        role: 'assistant',
        timestamp: new Date().toISOString(),
      },
    ]);
    textareaRef.current?.focus();
  }

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;

      // Add user message immediately
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        content: trimmed,
        role: 'user',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            conversationId: activeConversationId,
            context: {
              currentPage: pathname,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Chat request failed: ${response.status}`);
        }

        const data = await response.json();

        // Update conversation ID for persistence
        if (data.conversationId && !activeConversationId) {
          setActiveConversationId(data.conversationId);
          // Refresh the conversation list to show the new one
          loadConversations();
        }

        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          content: data.message,
          role: 'assistant',
          timestamp: new Date().toISOString(),
          model: data.model,
          suggestedAgent: data.suggestedAgent,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (error) {
        console.error('[FlowE] Chat error:', error);
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          content:
            'Sorry, I ran into an issue processing your message. Please try again in a moment.',
          role: 'assistant',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, activeConversationId, pathname],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as FormEvent);
      }
    },
    [handleSubmit],
  );

  // Show welcome state on initial load
  const showWelcome = messages.length === 0 && !activeConversationId;

  return (
    <div className="flex h-full -m-6 overflow-hidden">
      {/* ── Conversation Sidebar ── */}
      <div className="w-72 flex-shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <Button
            onClick={startNewConversation}
            className="w-full gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Conversation
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No conversations yet.</p>
              <p className="mt-1 text-xs">Start chatting with FlowE!</p>
            </div>
          ) : (
            <div className="py-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 text-sm transition-colors hover:bg-secondary/50',
                    activeConversationId === conv.id &&
                      'bg-accent text-foreground',
                  )}
                >
                  <div className="font-medium truncate text-foreground">
                    {conv.title || 'Untitled conversation'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeTime(conv.updated_at)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground font-display">
              FlowE
            </h1>
            <p className="text-xs text-muted-foreground">
              Your EntitleFlow AI assistant
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {showWelcome ? (
            <WelcomeScreen onStartChat={startNewConversation} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'max-w-[75%] flex flex-col gap-1',
                      message.role === 'user' ? 'items-end' : 'items-start',
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground',
                      )}
                    >
                      <MessageContent content={message.content} />
                    </div>

                    {/* Model badge */}
                    {message.role === 'assistant' && message.model && (
                      <div className="flex items-center gap-1 px-1">
                        <Zap className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {message.model.model === 'gemini-2.0-flash'
                            ? 'Gemini Flash'
                            : 'MiMo-v2-Pro'}
                        </span>
                      </div>
                    )}

                    {/* Suggested agent chip */}
                    {message.suggestedAgent && (
                      <div className="mt-1 inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-xs text-primary">
                        <Sparkles className="h-3 w-3" />
                        <span>Try: {message.suggestedAgent.name}</span>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-foreground">
                        You
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-secondary rounded-2xl px-4 py-3">
                    <TypingIndicator />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card px-6 py-4">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto relative rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-all"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask FlowE anything..."
              rows={1}
              className="w-full resize-none rounded-xl bg-transparent px-4 py-3 pr-24 text-sm placeholder:text-muted-foreground focus:outline-none"
              style={{ minHeight: '48px', maxHeight: '160px' }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button
                type="submit"
                size="sm"
                className="gap-1.5 rounded-lg"
                disabled={isLoading || !input.trim()}
              >
                Send
                <CornerDownLeft className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            FlowE can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function WelcomeScreen({ onStartChat }: { onStartChat: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground font-display mb-2">
        Welcome to FlowE
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Your AI assistant for navigating EntitleFlow, querying project data, and
        understanding NC building codes and jurisdiction requirements.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full mb-8">
        {[
          'How do I upload a permit document?',
          "What's the status of my projects?",
          'Explain the Greensboro TRC review process',
          'Help me understand reviewer comments',
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={onStartChat}
            className="text-left rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground hover:bg-secondary/50 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <Button onClick={onStartChat} className="gap-2">
        <Plus className="h-4 w-4" />
        Start a conversation
      </Button>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Simple paragraph rendering — split on double newlines
  const paragraphs = content.split(/\n\n+/);
  if (paragraphs.length <= 1) {
    return <>{content}</>;
  }
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className={i > 0 ? 'mt-2' : ''}>
          {p}
        </p>
      ))}
    </>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
