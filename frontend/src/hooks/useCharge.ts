import { useState, useCallback } from "react";
import type { Charge, ChargeStats } from "../types/charge";
import {
  type CreateChargeRequest,
  type UpdateChargeRequest,
  type BulkCreateRequest,
  type ChargeResponse,
  type DeleteChargeResponse,
  type BulkCreateResponse,
} from "../types/charge";
import chargeAPI from "@/api/charges";

export const useCharge = () => {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [stats, setStats] = useState<ChargeStats>({
    total_charges: 0,
    paid: 0,
    unpaid: 0,
    overdue: 0,
    partially_paid: 0,
    total_amount: 0,
    paid_amount: 0,
    unpaid_amount: 0,
    collection_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch charges with optional filters
  const fetchCharges = useCallback(
    async (filters?: {
      status?: string;
      search?: string;
      building_id?: number;
      apartment_id?: number;
      overdue?: boolean;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const chargeData = await chargeAPI.getCharges(filters);
        setCharges(chargeData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch charges";
        setError(errorMessage);
        console.error("Error fetching charges:", err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await chargeAPI.getChargeStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching charge statistics:", err);
    }
  }, []);

  // Create charge
  const createCharge = useCallback(
    async (data: CreateChargeRequest): Promise<Charge | null> => {
      try {
        const response: ChargeResponse = await chargeAPI.createCharge(data);

        const newCharge = response.data;
        const successMsg = response.message;

        setCharges((prev) => [...prev, newCharge]);
        await fetchStats();

        setSuccessMessage(successMsg);

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
        return newCharge;
      } catch (err) {
        let errorMessage = "Failed to create charge";

        if (err && typeof err === "object" && "response" in err) {
          const errorObj = err as any;
          if (errorObj.response?.data?.message) {
            errorMessage = errorObj.response.data.message;
          } else if (errorObj.response?.data?.error) {
            errorMessage = errorObj.response.data.error;
          } else if (errorObj.message) {
            errorMessage = errorObj.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error("Error creating charge:", err);
        return null;
      }
    },
    [fetchStats],
  );

  // Update charge
  const updateCharge = useCallback(
    async (id: number, data: UpdateChargeRequest): Promise<Charge | null> => {
      try {
        const response: ChargeResponse = await chargeAPI.updateCharge(id, data);

        const updatedCharge = response.data;
        const successMsg = response.message;

        setCharges((prev) =>
          prev.map((c) => (c.id === id ? updatedCharge : c)),
        );
        await fetchStats();

        setSuccessMessage(successMsg);

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);

        return updatedCharge;
      } catch (err) {
        let errorMessage = "Failed to update charge";

        if (err && typeof err === "object" && "response" in err) {
          const errorObj = err as any;
          if (errorObj.response?.data?.message) {
            errorMessage = errorObj.response.data.message;
          } else if (errorObj.response?.data?.error) {
            errorMessage = errorObj.response.data.error;
          } else if (errorObj.message) {
            errorMessage = errorObj.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error("Error updating charge:", err);
        return null;
      }
    },
    [fetchStats],
  );

  // Delete charge
  const deleteCharge = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const response: DeleteChargeResponse = await chargeAPI.deleteCharge(id);

        const successMsg = response.message;

        setCharges((prev) => prev.filter((c) => c.id !== id));
        await fetchStats();

        setSuccessMessage(successMsg);
        return true;
      } catch (err) {
        let errorMessage = "Failed to delete charge";

        if (err && typeof err === "object" && "response" in err) {
          const errorObj = err as any;
          if (errorObj.response?.data?.message) {
            errorMessage = errorObj.response.data.message;
          } else if (errorObj.response?.data?.error) {
            errorMessage = errorObj.response.data.error;
          } else if (errorObj.message) {
            errorMessage = errorObj.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error("Error deleting charge:", err);
        return false;
      }
    },
    [fetchStats],
  );

  // Bulk create charges
  const bulkCreateCharges = useCallback(
    async (data: BulkCreateRequest): Promise<boolean> => {
      try {
        const response: BulkCreateResponse =
          await chargeAPI.bulkCreateCharges(data);

        const successMsg = response.message;

        // Set success message - don't fetch here to avoid clearing it
        // The parent component will call handleModalSuccess() to refetch
        setSuccessMessage(successMsg);

        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);

        return true;
      } catch (err) {
        let errorMessage = "Failed to bulk create charges";

        if (err && typeof err === "object" && "response" in err) {
          const errorObj = err as any;
          if (errorObj.response?.data?.message) {
            errorMessage = errorObj.response.data.message;
          } else if (errorObj.response?.data?.error) {
            errorMessage = errorObj.response.data.error;
          } else if (errorObj.message) {
            errorMessage = errorObj.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error("Error bulk creating charges:", err);
        return false;
      }
    },
    [],
  );

  // Get charge details with payments
  const getChargeWithPayments = useCallback(async (id: number) => {
    try {
      return await chargeAPI.getChargeById(id);
    } catch (err) {
      console.error("Error fetching charge details:", err);
      throw err;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    charges,
    stats,
    loading,
    error,

    // Messages
    successMessage,

    // Actions
    createCharge,
    updateCharge,
    deleteCharge,
    bulkCreateCharges,
    getChargeWithPayments,

    // Refresh functions
    refetchCharges: fetchCharges,
    refetchStats: fetchStats,
    fetchFilteredCharges: fetchCharges,

    // Utility
    clearError,
  };
};
