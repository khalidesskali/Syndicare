import { useState, useEffect, useCallback } from "react";
import type { Reunion, ReunionStats } from "../types/reunion";
import reunionAPI, { type CreateReunionRequest } from "../api/reunions";

import type { UpdateReunionRequest } from "../types/reunion";

// Helper function to calculate stats from reunions data
const calculateStats = (reunions: Reunion[]): ReunionStats => {
  // Ensure reunions is an array
  const reunionsArray = Array.isArray(reunions) ? reunions : [];

  const totalReunions = reunionsArray.length;
  const upcomingReunions = reunionsArray.filter(
    (r) => r.status === "SCHEDULED"
  ).length;
  const completedReunions = reunionsArray.filter(
    (r) => r.status === "COMPLETED"
  ).length;
  const totalParticipants = reunionsArray.reduce(
    (sum, r) => sum + r.participants_count,
    0
  );
  const averageAttendance =
    totalReunions > 0
      ? Math.round(
          reunionsArray.reduce(
            (sum, r) => sum + (r.participants_count / r.max_participants) * 100,
            0
          ) / totalReunions
        )
      : 0;

  return {
    total_reunions: totalReunions,
    upcoming_reunions: upcomingReunions,
    completed_reunions: completedReunions,
    total_participants: totalParticipants,
    average_attendance: averageAttendance,
  };
};

export const useReunion = () => {
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [dateRange, setDateRange] = useState<
    { from?: Date; to?: Date } | undefined
  >();
  const [stats, setStats] = useState<ReunionStats>({
    total_reunions: 0,
    upcoming_reunions: 0,
    completed_reunions: 0,
    total_participants: 0,
    average_attendance: 0,
  });

  // Fetch reunions and calculate stats
  const fetchReunions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build filters for API
      const filters = {
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        building: buildingFilter !== "all" ? buildingFilter : undefined,
        date_from: dateRange?.from
          ? dateRange.from.toISOString().split("T")[0]
          : undefined,
        date_to: dateRange?.to
          ? dateRange.to.toISOString().split("T")[0]
          : undefined,
      };

      const reunionsData = await reunionAPI.getReunions(filters);
      setReunions(reunionsData);

      // Calculate stats from the fetched reunions data
      const statsData = calculateStats(reunionsData);
      setStats(statsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch reunions";
      setError(errorMessage);
      console.error("Error fetching reunions:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, buildingFilter, dateRange]);

  const createReunion = useCallback(
    async (data: CreateReunionRequest): Promise<Reunion | null> => {
      try {
        const newReunion = await reunionAPI.createReunion(data);
        setReunions((prev) => [...prev, newReunion]);
        await fetchReunions(); // Refresh stats
        return newReunion;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create reunion";
        setError(errorMessage);
        console.error("Error creating reunion:", err);
        return null;
      }
    },
    [fetchReunions]
  );

  const updateReunion = useCallback(
    async (id: number, data: UpdateReunionRequest): Promise<Reunion | null> => {
      try {
        console.log("useReunion updateReunion called with:", { id, data });
        console.log("data type:", typeof data);
        console.log("data keys:", Object.keys(data));

        const updatedReunion = await reunionAPI.updateReunion(id, data);
        setReunions((prev) =>
          prev.map((r) => (r.id === id ? updatedReunion : r))
        );
        await fetchReunions();
        return updatedReunion;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update reunion";
        setError(errorMessage);
        console.error("Error updating reunion:", err);
        return null;
      }
    },
    [fetchReunions]
  );

  const deleteReunion = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await reunionAPI.deleteReunion(id);
        setReunions((prev) => prev.filter((r) => r.id !== id));
        await fetchReunions(); // Refresh stats
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete reunion";
        setError(errorMessage);
        console.error("Error deleting reunion:", err);
        return false;
      }
    },
    [fetchReunions]
  );

  const bulkCreateReunions = useCallback(
    async (reunions: CreateReunionRequest[]): Promise<Reunion[] | null> => {
      try {
        const newReunions = await reunionAPI.bulkCreateReunions(reunions);
        setReunions((prev) => [...prev, ...newReunions]);
        await fetchReunions(); // Refresh stats
        return newReunions;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to bulk create reunions";
        setError(errorMessage);
        console.error("Error bulk creating reunions:", err);
        return null;
      }
    },
    [fetchReunions]
  );

  const updateReunionStatus = useCallback(
    async (id: number, status: Reunion["status"]): Promise<Reunion | null> => {
      try {
        const updatedReunion = await reunionAPI.updateReunionStatus(id, status);
        setReunions((prev) =>
          prev.map((r) => (r.id === id ? updatedReunion : r))
        );
        await fetchReunions(); // Refresh stats
        return updatedReunion;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update reunion status";
        setError(errorMessage);
        console.error("Error updating reunion status:", err);
        return null;
      }
    },
    [fetchReunions]
  );

  const addParticipant = useCallback(
    async (
      reunionId: number,
      participantEmail: string
    ): Promise<Reunion | null> => {
      try {
        const updatedReunion = await reunionAPI.addParticipant(
          reunionId,
          participantEmail
        );
        setReunions((prev) =>
          prev.map((r) => (r.id === reunionId ? updatedReunion : r))
        );
        await fetchReunions(); // Refresh stats
        return updatedReunion;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add participant";
        setError(errorMessage);
        console.error("Error adding participant:", err);
        return null;
      }
    },
    [fetchReunions]
  );

  const removeParticipant = useCallback(
    async (
      reunionId: number,
      participantEmail: string
    ): Promise<Reunion | null> => {
      try {
        const updatedReunion = await reunionAPI.removeParticipant(
          reunionId,
          participantEmail
        );
        setReunions((prev) =>
          prev.map((r) => (r.id === reunionId ? updatedReunion : r))
        );
        await fetchReunions(); // Refresh stats
        return updatedReunion;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to remove participant";
        setError(errorMessage);
        console.error("Error removing participant:", err);
        return null;
      }
    },
    [fetchReunions]
  );

  // Initialize data and refetch when filters change
  useEffect(() => {
    fetchReunions();
  }, [fetchReunions]);

  return {
    // Data
    reunions,
    stats,
    loading,
    error,

    // Filter state
    searchTerm,
    statusFilter,
    buildingFilter,
    dateRange,

    // Filter setters
    setSearchTerm,
    setStatusFilter,
    setBuildingFilter,
    setDateRange,

    // API actions
    createReunion,
    updateReunion,
    deleteReunion,
    bulkCreateReunions,
    updateReunionStatus,
    addParticipant,
    removeParticipant,

    // Utility
    refetch: fetchReunions,
  };
};
