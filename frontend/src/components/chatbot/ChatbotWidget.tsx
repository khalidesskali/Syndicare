import React, { useState, useRef, useEffect } from "react";
import ChatbotButton from "./ChatbotButton";
import ChatbotPanel from "./ChatbotPanel";
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

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("charge") && lowerMessage.includes("calculat")) {
      return "Charges are calculated based on your apartment's share of common expenses, including maintenance, utilities, and building management costs. Each charge is proportionally divided according to your apartment's coefficient.";
    } else if (
      lowerMessage.includes("pay") &&
      lowerMessage.includes("charge")
    ) {
      return "You can pay your charges through several methods: bank transfer, online payment portal, or directly at the management office. Payments are typically due within 30 days of the charge issuance date.";
    } else if (lowerMessage.includes("overdue")) {
      return "Overdue means a charge payment has passed its due date without being paid. Overdue charges may incur late fees and could affect your standing with the building management.";
    } else if (lowerMessage.includes("complaint")) {
      return "To submit a complaint, navigate to the 'Complaints' section in your dashboard, click 'New Complaint', fill in the details including the issue type and description, and submit. You'll receive updates on the resolution progress.";
    } else {
      return "I understand your question. For more specific information about this topic, you can check the relevant section in your dashboard or contact the building management directly. Is there anything else I can help you with?";
    }
  };

  const handleSendMessage = (text: string) => {
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

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(text),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
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
