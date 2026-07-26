"use client";

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react";
import type { PageVisit } from "@/lib/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  pages: PageVisit[];
  loadingPages: boolean;
  connected: boolean;
}

export function ChatInterface({ pages, loadingPages, connected }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isThinking) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/groq-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          candidates: pages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate response");

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, an error occurred: ${err instanceof Error ? err.message : "Unknown error"}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full pb-4">
      {/* Extension status notice */}
      {!loadingPages && !connected && (
        <div className="max-w-4xl mx-auto w-full px-4">
          <div className="mt-4 p-4 rounded-xl bg-surface-2 border border-divider text-center shadow-lg">
            <p className="text-text-secondary text-sm font-medium">
              Recall extension not connected
            </p>
            <p className="text-text-muted text-xs mt-1">
              Install and reload the extension in Chrome to enable browsing memory search.
            </p>
          </div>
        </div>
      )}

      {/* Messages area — full width so scrollbar sits at screen edge */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
        {/* Inner content constrained to max-w-4xl */}
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent/20 to-lilac/30 flex items-center justify-center mb-6 border border-accent/20 shadow-inner">
              <svg className="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-text-primary mb-2 tracking-tight">
              Ask Recall about your browsing history
            </h2>
            <p className="text-text-secondary text-sm max-w-md">
              Recall continuously indexes the pages you visit. Type a question below to find anything you've seen.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-lilac flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-md">
                  AI
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[75%] text-sm leading-relaxed break-words ${
                  msg.role === "user"
                    ? "text-white text-right"
                    : "text-text-primary"
                }`}
              >
                <div>{renderFormattedContent(msg.content)}</div>
                <div
                  className={`text-[10px] mt-1.5 ${
                    msg.role === "user" ? "text-white/70 text-right" : "text-text-muted"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))
        )}

        {isThinking && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-lilac flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-md animate-pulse">
              AI
            </div>
            <div className="text-text-muted text-xs flex items-center gap-2">
              <span>Thinking & searching browsing memory</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area fixed at bottom, centered */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-2">
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center bg-surface-2 border border-divider focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10 rounded-[28px] shadow-xl transition-all p-2 gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              connected
                ? "Ask anything about pages you visited (e.g. did I check Liverpool?)..."
                : "Connecting extension..."
            }
            disabled={isThinking}
            className="flex-1 bg-transparent px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 active:scale-95 shadow-md ${
              input.trim()
                ? "bg-accent hover:bg-accent-hover text-white cursor-pointer"
                : "bg-transparent text-text-muted cursor-not-allowed opacity-40"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Parses markdown links [Title](url) and renders them as styled blue underlined clickable links.
 */
function renderFormattedContent(text: string) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const title = match[1];
    const url = match[2];

    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent font-semibold underline underline-offset-4 hover:text-accent-hover transition-colors mx-0.5"
      >
        {title}
      </a>
    );

    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, index) => (typeof part === "string" ? part : <span key={index}>{part}</span>))}
    </span>
  );
}
