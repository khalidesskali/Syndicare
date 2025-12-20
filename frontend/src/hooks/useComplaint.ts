import { useState, useEffect, useCallback } from "react";
import type { Complaint, ComplaintStats } from "../types/complaint";
import { complaintAPI } from "../api/complaints";
import type {
  UpdateComplaintRequest,
  ComplaintFilters,
} from "../types/complaint";

// Helper function to calculate stats from complaints data
const calculateStats = (complaints: Complaint[]): ComplaintStats => {
  // Ensure complaints is an array
  const complaintsArray = Array.isArray(complaints) ? complaints : [];

  const total = complaintsArray.length;
  const pending = complaintsArray.filter((c) => c.status === "PENDING").length;
  const in_progress = complaintsArray.filter(
    (c) => c.status === "IN_PROGRESS"
  ).length;
  const resolved = complaintsArray.filter(
    (c) => c.status === "RESOLVED"
  ).length;
  const rejected = complaintsArray.filter(
    (c) => c.status === "REJECTED"
  ).length;

  const by_priority = {
    urgent: complaintsArray.filter((c) => c.priority === "URGENT").length,
    high: complaintsArray.filter((c) => c.priority === "HIGH").length,
    medium: complaintsArray.filter((c) => c.priority === "MEDIUM").length,
    low: complaintsArray.filter((c) => c.priority === "LOW").length,
  };

  return {
    total,
    pending,
    in_progress,
    resolved,
    rejected,
    by_priority,
  };
};

export const useComplaint = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [dateRange, setDateRange] = useState<
    { from?: Date; to?: Date } | undefined
  >();
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
    by_priority: {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
  });

  // Fetch complaints and calculate stats
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build filters for API
      const filters: ComplaintFilters = {
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        building_id: buildingFilter !== "all" ? buildingFilter : undefined,
        date_from: dateRange?.from
          ? dateRange.from.toISOString().split("T")[0]
          : undefined,
        date_to: dateRange?.to
          ? dateRange.to.toISOString().split("T")[0]
          : undefined,
      };

      const complaintsData = await complaintAPI.getComplaints(filters);
      setComplaints(complaintsData);

      // Calculate stats from the fetched complaints data
      const statsData = calculateStats(complaintsData);
      setStats(statsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch complaints";
      setError(errorMessage);
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, priorityFilter, buildingFilter, dateRange]);

  const updateComplaint = useCallback(
    async (
      id: number,
      data: UpdateComplaintRequest
    ): Promise<Complaint | null> => {
      try {
        const updatedComplaint = await complaintAPI.updateComplaint(id, data);
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? updatedComplaint : c))
        );
        await fetchComplaints(); // Refresh stats
        return updatedComplaint;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update complaint";
        setError(errorMessage);
        console.error("Error updating complaint:", err);
        return null;
      }
    },
    [fetchComplaints]
  );

  const deleteComplaint = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await complaintAPI.deleteComplaint(id);
        setComplaints((prev) => prev.filter((c) => c.id !== id));
        await fetchComplaints(); // Refresh stats
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete complaint";
        setError(errorMessage);
        console.error("Error deleting complaint:", err);
        return false;
      }
    },
    [fetchComplaints]
  );

  const respondToComplaint = useCallback(
    async (
      id: number,
      response: string,
      status?: string
    ): Promise<Complaint | null> => {
      try {
        const updatedComplaint = await complaintAPI.respondToComplaint(
          id,
          response,
          status
        );
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? updatedComplaint : c))
        );
        await fetchComplaints(); // Refresh stats
        return updatedComplaint;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to respond to complaint";
        setError(errorMessage);
        console.error("Error responding to complaint:", err);
        return null;
      }
    },
    [fetchComplaints]
  );

  const markAsResolved = useCallback(
    async (id: number): Promise<Complaint | null> => {
      try {
        const updatedComplaint = await complaintAPI.markAsResolved(id);
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? updatedComplaint : c))
        );
        await fetchComplaints(); // Refresh stats
        return updatedComplaint;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to mark complaint as resolved";
        setError(errorMessage);
        console.error("Error marking complaint as resolved:", err);
        return null;
      }
    },
    [fetchComplaints]
  );

  const markAsInProgress = useCallback(
    async (id: number): Promise<Complaint | null> => {
      try {
        const updatedComplaint = await complaintAPI.markAsInProgress(id);
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? updatedComplaint : c))
        );
        await fetchComplaints(); // Refresh stats
        return updatedComplaint;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to mark complaint as in progress";
        setError(errorMessage);
        console.error("Error marking complaint as in progress:", err);
        return null;
      }
    },
    [fetchComplaints]
  );

  const rejectComplaint = useCallback(
    async (id: number, response: string): Promise<Complaint | null> => {
      try {
        const updatedComplaint = await complaintAPI.rejectComplaint(
          id,
          response
        );
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? updatedComplaint : c))
        );
        await fetchComplaints(); // Refresh stats
        return updatedComplaint;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to reject complaint";
        setError(errorMessage);
        console.error("Error rejecting complaint:", err);
        return null;
      }
    },
    [fetchComplaints]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize data and refetch when filters change
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return {
    // Data
    complaints,
    stats,
    loading,
    error,

    // Filter state
    searchTerm,
    statusFilter,
    priorityFilter,
    buildingFilter,
    dateRange,

    // Filter setters
    setSearchTerm,
    setStatusFilter,
    setPriorityFilter,
    setBuildingFilter,
    setDateRange,

    // API actions
    updateComplaint,
    deleteComplaint,
    respondToComplaint,
    markAsResolved,
    markAsInProgress,
    rejectComplaint,

    // Utility
    refetch: fetchComplaints,
    clearError,
  };
};
