import React, { useState, useRef, useEffect } from "react";
import ChatbotButton from "./ChatbotButton";
import ChatbotPanel from "./ChatbotPanel";
import { chatbotApi } from "@/api/chatbotApi";
import type { Message } from "./types";

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Syndicare Assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "How are charges calculated?",
    "How do I pay my charges?",
    "What does overdue mean?",
    "How to submit a complaint?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await chatbotApi.sendMessage(text.trim());

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply || "Sorry, I didn't understand that.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Chatbot error:", error);

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setHasUnreadMessages(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <ChatbotButton
        isOpen={isOpen}
        hasUnreadMessages={hasUnreadMessages}
        onClick={handleToggle}
      />

      {isOpen && (
        <ChatbotPanel
          messages={messages}
          inputValue={inputValue}
          isTyping={isTyping}
          quickQuestions={quickQuestions}
          formatTime={formatTime}
          messagesEndRef={messagesEndRef}
          onClose={handleToggle}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          onQuickQuestion={handleQuickQuestion}
        />
      )}
    </div>
  );
};

export default ChatbotWidget;
