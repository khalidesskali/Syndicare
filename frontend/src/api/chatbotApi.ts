import axiosInstance from "@/api/axios";

export interface ChatbotResponse {
  intent?: string;
  confidence?: number;
  reply?: string;
  error?: string;
}

export const chatbotApi = {
  sendMessage: async (message: string): Promise<ChatbotResponse> => {
    try {
      const response = await axiosInstance.post("chat/", {
        message,
      });
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.error || "Failed to send message",
      };
    }
  },
};
