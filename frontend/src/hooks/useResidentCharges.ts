import { useState, useCallback } from "react";
import type { Charge } from "../types/residentPortal";
import residentChargeAPI, {
  type ResidentChargePaymentRequest,
} from "../api/residentCharges";

export const useResidentCharges = () => {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [payingChargeId, setPayingChargeId] = useState<number | null>(null);

  // Fetch all resident charges
  const fetchCharges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const chargesData = await residentChargeAPI.getResidentCharges();
      setCharges(chargesData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch charges";
      setError(errorMessage);
      console.error("Error fetching charges:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single charge by ID
  const getChargeById = useCallback(
    async (id: number): Promise<Charge | null> => {
      try {
        return await residentChargeAPI.getResidentChargeById(id);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch charge details";
        setError(errorMessage);
        console.error("Error fetching charge details:", err);
        return null;
      }
    },
    []
  );

  // Pay a charge
  const payCharge = useCallback(
    async (
      id: number,
      paymentData: ResidentChargePaymentRequest
    ): Promise<boolean> => {
      setPayingChargeId(id);
      setError(null);
      setErrorMessage(null);

      try {
        const response = await residentChargeAPI.payResidentCharge(
          id,
          paymentData
        );

        if (response.success) {
          setSuccessMessage(response.message);

          // Update the charge in the local state
          setCharges((prev) =>
            prev.map((charge) =>
              charge.id === id ? { ...charge, status: "PAID" } : charge
            )
          );

          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);

          return true;
        } else {
          throw new Error(response.message);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to process payment";
        setError(errorMessage);
        setErrorMessage(errorMessage);
        console.error("Error paying charge:", err);
        return false;
      } finally {
        setPayingChargeId(null);
      }
    },
    []
  );

  // Filter charges by status
  const getFilteredCharges = useCallback(
    (status: "ALL" | Charge["status"]): Charge[] => {
      if (status === "ALL") return charges;
      return charges.filter((charge) => charge.status === status);
    },
    [charges]
  );

  // Get charge statistics
  const getChargeStats = useCallback(() => {
    const totalCharges = charges.length;
    const unpaidCharges = charges.filter((c) => c.status === "UNPAID");
    const overdueCharges = charges.filter((c) => c.status === "OVERDUE");
    const paidCharges = charges.filter((c) => c.status === "PAID");

    const totalAmount = charges.reduce((sum, charge) => sum + charge.amount, 0);
    const unpaidAmount = [...unpaidCharges, ...overdueCharges].reduce(
      (sum, charge) => sum + charge.amount,
      0
    );
    const paidAmount = paidCharges.reduce(
      (sum, charge) => sum + charge.amount,
      0
    );

    return {
      totalCharges,
      unpaidCharges: unpaidCharges.length + overdueCharges.length,
      paidCharges: paidCharges.length,
      totalAmount,
      unpaidAmount,
      paidAmount,
      collectionRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
    };
  }, [charges]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  return {
    // Data
    charges,
    loading,
    error,

    // Messages
    successMessage,
    errorMessage,

    // Loading states
    payingChargeId,

    // Actions
    fetchCharges,
    getChargeById,
    payCharge,
    getFilteredCharges,
    getChargeStats,
    clearMessages,

    // Utility
    refetchCharges: fetchCharges,
  };
};
