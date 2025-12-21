import { useState, useEffect, useCallback } from "react";
import dashboardAPI from "../api/dashboard";
import type { DashboardStats, DashboardResponse } from "../types/dashboard";

export const useSyndicDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: DashboardResponse =
        await dashboardAPI.getDashboardStats();

      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch dashboard data");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load dashboard data";
      setError(errorMessage);
      console.error("Dashboard API Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Action handlers for UI
  const handleAddBuilding = useCallback(() => {
    console.log("Navigate to add building");
    // Future: Navigate to building creation page
  }, []);

  const handleAddResident = useCallback(() => {
    console.log("Navigate to add resident");
    // Future: Navigate to resident creation page
  }, []);

  const handleCreateCharge = useCallback(() => {
    console.log("Navigate to create charge");
    // Future: Navigate to charge creation page
  }, []);

  const handleScheduleMeeting = useCallback(() => {
    console.log("Navigate to schedule meeting");
    // Future: Navigate to meeting scheduling page
  }, []);

  // Initialize data
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    // Data
    stats,
    loading,
    error,

    // API actions
    refreshData,

    // UI actions
    handleAddBuilding,
    handleAddResident,
    handleCreateCharge,
    handleScheduleMeeting,

    // Utility
    clearError,
  };
};
