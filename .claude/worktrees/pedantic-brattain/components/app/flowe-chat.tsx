"use client";

import { useState, useCallback, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { CornerDownLeft, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { ChatInput } from "@/components/ui/chat-input";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import { ChatMessageList } from "@/components/ui/chat-message-list";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
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

// ---------------------------------------------------------------------------
// FlowE Chat Component
// ---------------------------------------------------------------------------

export function FlowEChat() {
  const pathname = usePathname();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content:
        "Hey! I'm FlowE, your EntitleFlow assistant. I can help you navigate the platform, answer questions about your projects and permits, or explain NC building codes and jurisdiction requirements. What can I help with?",
      role: "assistant",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;

      // Add user message immediately
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        content: trimmed,
        role: "user",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            conversationId,
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
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }

        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          content: data.message,
          role: "assistant",
          timestamp: new Date().toISOString(),
          model: data.model,
          suggestedAgent: data.suggestedAgent,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (error) {
        console.error("[FlowE] Chat error:", error);
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          content:
            "Sorry, I ran into an issue processing your message. Please try again in a moment.",
          role: "assistant",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, conversationId, pathname],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as FormEvent);
      }
    },
    [handleSubmit],
  );

  return (
    <ExpandableChat
      size="lg"
      position="bottom-right"
      icon={<FlowEIcon />}
    >
      <ExpandableChatHeader className="flex-col text-center justify-center bg-card">
        <div className="flex items-center gap-2 justify-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-lg font-semibold text-foreground font-display">
            FlowE
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Your EntitleFlow AI assistant
        </p>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ChatMessageList smooth>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.role === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                className="h-7 w-7 shrink-0"
                fallback={message.role === "user" ? "You" : "FE"}
              />
              <div className="flex flex-col gap-1 max-w-[85%]">
                <ChatBubbleMessage
                  variant={message.role === "user" ? "sent" : "received"}
                >
                  {message.content}
                </ChatBubbleMessage>

                {/* Model badge for assistant messages */}
                {message.role === "assistant" && message.model && (
                  <div className="flex items-center gap-1 px-1">
                    <Zap className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {message.model.model === "gemini-2.0-flash"
                        ? "Gemini Flash"
                        : "MiMo-v2-Pro"}
                    </span>
                  </div>
                )}

                {/* Suggested agent chip */}
                {message.suggestedAgent && (
                  <div className="mt-1 inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-xs text-primary">
                    <Sparkles className="h-3 w-3" />
                    <span>
                      Try: {message.suggestedAgent.name}
                    </span>
                  </div>
                )}
              </div>
            </ChatBubble>
          ))}

          {isLoading && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                className="h-7 w-7 shrink-0"
                fallback="FE"
              />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter className="bg-card">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask FlowE anything..."
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0 justify-end">
            <Button
              type="submit"
              size="sm"
              className="gap-1.5"
              disabled={isLoading || !input.trim()}
            >
              Send
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  );
}

// ---------------------------------------------------------------------------
// FlowE icon for the toggle button
// ---------------------------------------------------------------------------

function FlowEIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary-foreground"
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
