import axiosInstance from "./axios";

export interface Notification {
  id: number;
  recipient: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  related_entity_id: number | null;
  created_at: string;
}

export const notificationApi = {
  getNotifications: async () => {
    const response = await axiosInstance.get("/notifications/");
    return response.data;
  },

  markAsRead: async (id: number) => {
    const response = await axiosInstance.patch(
      `/notifications/${id}/mark-read/`,
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.post("/notifications/mark-all-read/");
    return response.data;
  },
};
