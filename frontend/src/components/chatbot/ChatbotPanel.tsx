import React, { useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import ChatMessage from "./ChatMessage";
import type { Message } from "./types";

interface ChatbotPanelProps {
  messages: Message[];
  inputValue: string;
  isTyping: boolean;
  quickQuestions: string[];
  formatTime: (date: Date) => string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onSendMessage: (message: string) => void;
  onQuickQuestion: (question: string) => void;
}

const ChatbotPanel: React.FC<ChatbotPanelProps> = ({
  messages,
  inputValue,
  isTyping,
  quickQuestions,
  formatTime,
  messagesEndRef,
  onClose,
  onInputChange,
  onSendMessage,
  onQuickQuestion,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(inputValue);
    }
  };

  return (
    <div className="absolute bottom-16 right-0 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Syndicare Assistant</h3>
          <p className="text-blue-100 text-sm">How can I help you?</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            formatTime={formatTime}
          />
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 bg-blue-600 rounded-full" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-slate-200">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions (only show for first bot message) */}
      {messages.length === 1 && (
        <div className="px-4 py-3 bg-white border-t border-slate-100">
          <p className="text-sm text-slate-600 mb-2">Quick questions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => onQuickQuestion(question)}
                className="text-xs bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 px-3 py-2 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isTyping}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPanel;
