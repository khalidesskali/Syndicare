import { useState, useEffect } from "react";
import syndicPaymentAPI, { type SyndicPayment } from "@/api/syndicPayments";

interface Filters {
  status: string;
  building_id: string;
  apartment_id: string;
  payment_method: string;
  searchTerm: string;
}

interface UseSyndicPaymentsReturn {
  payments: SyndicPayment[];
  loading: boolean;
  error: string | null;
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  refreshPayments: () => void;
  confirmPayment: (id: number) => Promise<void>;
  rejectPayment: (id: number, reason?: string) => Promise<void>;
  clearError: () => void;
}

export const useSyndicPayments = (): UseSyndicPaymentsReturn => {
  const [payments, setPayments] = useState<SyndicPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<Filters>({
    status: "",
    building_id: "",
    apartment_id: "",
    payment_method: "",
    searchTerm: "",
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const paymentsData = await syndicPaymentAPI.getSyndicPayments(filters);

      setPayments(paymentsData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const setFilters = (newFilters: Partial<Filters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const confirmPayment = async (id: number) => {
    try {
      await syndicPaymentAPI.confirmPayment(id);
      await fetchPayments(); // Refresh the list
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Failed to confirm payment",
      );
    }
  };

  const rejectPayment = async (id: number, reason?: string) => {
    try {
      await syndicPaymentAPI.rejectPayment(id, reason);
      await fetchPayments(); // Refresh the list
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Failed to reject payment",
      );
    }
  };

  const refreshPayments = () => {
    fetchPayments();
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  return {
    payments,
    loading,
    error,
    filters,
    setFilters,
    refreshPayments,
    confirmPayment,
    rejectPayment,
    clearError: () => setError(null),
  };
};
