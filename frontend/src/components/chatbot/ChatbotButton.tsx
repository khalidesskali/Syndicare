import React from "react";
import { MessageCircle, X } from "lucide-react";

interface ChatbotButtonProps {
  isOpen: boolean;
  hasUnreadMessages: boolean;
  onClick: () => void;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({
  isOpen,
  hasUnreadMessages,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center justify-center w-14 h-14 rounded-full 
        bg-gradient-to-br from-blue-600 to-blue-700 
        hover:from-blue-700 hover:to-blue-800 
        text-white shadow-lg hover:shadow-xl 
        transform transition-all duration-300 hover:scale-110
        focus:outline-none focus:ring-4 focus:ring-blue-300 cursor-pointer
        ${isOpen ? "rotate-180" : "rotate-0"}
      `}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <MessageCircle className="h-6 w-6" />
      )}

      {/* Notification Badge */}
      {!isOpen && hasUnreadMessages && (
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-pulse">
          <span className="sr-only">New messages</span>
        </span>
      )}

      {/* Ripple Effect */}
      <span className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-20 transition-opacity duration-300" />
    </button>
  );
};

export default ChatbotButton;
