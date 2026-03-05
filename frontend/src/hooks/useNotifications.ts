import { useState, useEffect, useCallback } from "react";
import { notificationApi, type Notification } from "../api/notificationApi";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationApi.getNotifications();
      // Django viewset format is usually an array or {count: X, results: [] }
      const newNotifications = Array.isArray(data)
        ? data
        : data.results || data.data || [];
      setNotifications(newNotifications);
      setUnreadCount(
        newNotifications.filter((n: Notification) => !n.read).length,
      );
      setError(null);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      // Suppress UI error for polling background tasks, just log it
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Poll every 60 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};
