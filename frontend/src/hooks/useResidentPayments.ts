import { useState, useCallback } from "react";
import type { Payment } from "../api/residentPayments";
import residentPaymentAPI from "../api/residentPayments";

export const useResidentPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch all resident payments
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const paymentsData = await residentPaymentAPI.getResidentPayments();
      setPayments(paymentsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch payments";
      setError(errorMessage);
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single payment by ID
  const getPaymentById = useCallback(
    async (id: number): Promise<Payment | null> => {
      try {
        return await residentPaymentAPI.getResidentPaymentById(id);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch payment details";
        setError(errorMessage);
        console.error("Error fetching payment details:", err);
        return null;
      }
    },
    []
  );

  // Get payment statistics
  const getPaymentStats = useCallback(() => {
    // Ensure payments is an array
    const paymentsArray = Array.isArray(payments) ? payments : [];

    const totalPayments = paymentsArray.length;
    const pendingPayments = paymentsArray.filter((p) => p.status === "PENDING");
    const confirmedPayments = paymentsArray.filter(
      (p) => p.status === "CONFIRMED"
    );
    const rejectedPayments = paymentsArray.filter(
      (p) => p.status === "REJECTED"
    );

    const totalAmount = paymentsArray.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const pendingAmount = pendingPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const confirmedAmount = confirmedPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );

    return {
      totalPayments,
      pendingPayments: pendingPayments.length,
      confirmedPayments: confirmedPayments.length,
      rejectedPayments: rejectedPayments.length,
      totalAmount,
      pendingAmount,
      confirmedAmount,
      confirmationRate:
        totalAmount > 0 ? (confirmedAmount / totalAmount) * 100 : 0,
    };
  }, [payments]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  return {
    // Data
    payments,
    loading,
    error,

    // Messages
    successMessage,
    errorMessage,

    // Actions
    fetchPayments,
    getPaymentById,
    getPaymentStats,
    clearMessages,

    // Utility
    refetchPayments: fetchPayments,
  };
};
