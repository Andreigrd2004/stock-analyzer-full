'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { conversationApi } from '@/lib/conversationApi';
import styles from './AiChat.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatProps {
  symbol: string;
  companyName: string;
  currentPrice: string;
}

/** Convert message array → plain-text history the backend expects */
function buildHistoryString(messages: Message[]): string {
  return messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');
}

export const AiChat: React.FC<AiChatProps> = ({ symbol, companyName, currentPrice }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await conversationApi.sendMessage({
        userMessage: text,
        companyName,
        stockSymbol: symbol,
        currentPrice,
        conversationHistory: buildHistoryString(messages), // history BEFORE current msg
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.message },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, symbol, companyName, currentPrice]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <div className={styles.chatRoot}>
      {/* ── Floating Chat Window ── */}
      <div className={`${styles.chatWindow} ${isOpen ? styles.chatWindowOpen : ''}`}>
        {/* Header */}
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderLeft}>
            <span className={`material-symbols-outlined ${styles.headerIcon}`}>auto_awesome</span>
            <div>
              <span className={styles.chatTitle}>Stock Intelligence</span>
              <div className={styles.liveBadge}>
                <span className={styles.liveDot} />
                <span className={styles.liveLabel}>Live</span>
              </div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close chat">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.length === 0 && (
            <div className={styles.emptyChat}>
              <span className={`material-symbols-outlined ${styles.emptyChatIcon}`}>forum</span>
              <p className={styles.emptyChatText}>
                Ask me anything about <strong>{symbol}</strong>
                {companyName ? ` (${companyName})` : ''}.
              </p>
              <div className={styles.suggestions}>
                {[
                  `What's the short-term outlook for ${symbol}?`,
                  'What are the key risks?',
                  'Should I buy or hold?',
                ].map((s) => (
                  <button
                    key={s}
                    className={styles.suggestionChip}
                    onClick={() => {
                      setInput(s);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`${styles.messageBubble} ${
                msg.role === 'user' ? styles.userBubble : styles.aiBubble
              }`}
            >
              {msg.role === 'assistant' && (
                <span className={`material-symbols-outlined ${styles.aiBubbleIcon}`}>
                  smart_toy
                </span>
              )}
              <p className={styles.bubbleText}>{msg.content}</p>
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.messageBubble} ${styles.aiBubble}`}>
              <span className={`material-symbols-outlined ${styles.aiBubbleIcon}`}>smart_toy</span>
              <div className={styles.typingIndicator}>
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            className={styles.chatInput}
            type="text"
            placeholder={`Ask about ${symbol}…`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            aria-label="Chat message input"
          />
          <button
            className={styles.sendBtn}
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>

      {/* ── FAB Toggle Button ── */}
      <button
        className={styles.fab}
        onClick={toggleChat}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      >
        <div className={styles.fabPing} />
        {isOpen ? (
          <span className="material-symbols-outlined">close</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
          </svg>
        )}
        {messages.length > 0 && !isOpen && (
          <span className={styles.unreadBadge}>{messages.filter((m) => m.role === 'assistant').length}</span>
        )}
      </button>
    </div>
  );
};
