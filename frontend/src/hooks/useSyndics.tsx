import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import type {
  Syndic,
  SyndicFilters,
  SyndicStats,
  SyndicFormData,
} from "../types/syndics";
import axiosInstance from "../api/axios";

const API_URL = "http://localhost:8000/api";

const useSyndics = () => {
  const { isAuthenticated } = useAuth();
  const [syndics, setSyndics] = useState<Syndic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SyndicStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_count: 0,
  });

  const fetchSyndics = useCallback(
    async (filters: Partial<SyndicFilters> = {}) => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== "all") {
            params.append(key, value.toString());
          }
        });

        // The axiosInstance interceptor will handle adding the auth token
        const response = await axiosInstance.get(
          `${API_URL}/admin/syndics/?${params.toString()}`
        );

        setSyndics(response.data.results);
        setPagination({
          page: response.data.page,
          page_size: response.data.page_size,
          total_pages: response.data.total_pages,
          total_count: response.data.total_count,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch syndics");
        console.error("Error fetching syndics:", err);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  const fetchSyndicStats = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await axiosInstance.get(
        `${API_URL}/admin/syndics/stats/`
      );
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching syndic stats:", err);
    }
  }, [isAuthenticated]);

  const getSyndic = useCallback(
    async (id: number): Promise<Syndic | null> => {
      if (!isAuthenticated) return null;

      try {
        const response = await axiosInstance.get(
          `${API_URL}/admin/syndics/${id}/`
        );
        return response.data;
      } catch (err: any) {
        console.error(`Error fetching syndic ${id}:`, err);
        setError(err.response?.data?.message || "Failed to fetch syndic");
        return null;
      }
    },
    [isAuthenticated]
  );

  const createSyndic = async (data: SyndicFormData): Promise<Syndic | null> => {
    if (!isAuthenticated) return null;

    try {
      const response = await axiosInstance.post(
        `${API_URL}/admin/syndics/`,
        data
      );
      await fetchSyndics(); // Refresh the list
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create syndic");
      throw err;
    }
  };

  const updateSyndic = async (
    id: number,
    data: Partial<SyndicFormData>
  ): Promise<Syndic | null> => {
    if (!isAuthenticated) return null;

    try {
      const response = await axiosInstance.patch(
        `${API_URL}/admin/syndics/${id}/`,
        data
      );
      setSyndics(
        syndics.map((s) => (s.id === id ? { ...s, ...response.data } : s))
      );
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update syndic");
      throw err;
    }
  };

  const deleteSyndic = async (id: number): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      await axiosInstance.delete(`${API_URL}/admin/syndics/${id}/`);
      setSyndics(syndics.filter((s) => s.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete syndic");
      return false;
    }
  };

  const toggleSyndicStatus = async (
    id: number,
    isActive: boolean
  ): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      await axiosInstance.patch(`${API_URL}/admin/syndics/${id}/status/`, {
        is_active: isActive,
      });
      setSyndics(
        syndics.map((s) => (s.id === id ? { ...s, is_active: isActive } : s))
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update syndic status");
      return false;
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchSyndics();
      fetchSyndicStats();
    }
  }, [isAuthenticated, fetchSyndics, fetchSyndicStats]);

  return {
    syndics,
    loading,
    error,
    stats,
    pagination,
    fetchSyndics,
    getSyndic,
    createSyndic,
    updateSyndic,
    deleteSyndic,
    toggleSyndicStatus,
  };
};

export default useSyndics;
