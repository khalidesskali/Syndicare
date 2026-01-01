import React from "react";
import type { Message } from "./types";

interface ChatMessageProps {
  message: Message;
  formatTime: (date: Date) => string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, formatTime }) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={`flex items-start space-x-2 ${
        isUser ? "flex-row-reverse space-x-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
            : "bg-blue-100"
        }`}
      >
        {isUser ? (
          <span className="text-sm font-semibold">U</span>
        ) : (
          <div className="w-4 h-4 bg-blue-600 rounded-full" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[70%] ${
          isUser
            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-none"
            : "bg-white rounded-2xl rounded-tl-none shadow-sm border border-slate-200"
        } px-4 py-3`}
      >
        <p
          className={`text-sm ${
            isUser ? "text-white" : "text-slate-700"
          } leading-relaxed`}
        >
          {message.text}
        </p>
        <p
          className={`text-xs mt-1 ${
            isUser ? "text-blue-100" : "text-slate-500"
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
