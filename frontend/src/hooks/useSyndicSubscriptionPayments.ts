import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

interface Payment {
  id: number;
  amount: number;
  payment_method: "BANK_TRANSFER";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  reference?: string;
  notes?: string;
  payment_date: string;
  payment_proof?: string;
  subscription?: {
    id: number;
    plan: {
      name: string;
    };
  };
}

export interface PaymentFormData {
  amount: string;
  payment_method: "BANK_TRANSFER";
  reference?: string;
  notes?: string;
  subscription_id?: string;
  rib?: string;
  payment_proof?: File;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  max_buildings: number;
  max_apartments: number;
  is_active: boolean;
}

interface UsePaymentsReturn {
  payments: Payment[];
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    payment_method: string;
    searchTerm: string;
  };
  stats: {
    totalRevenue: number;
    completedPayments: number;
    pendingPayments: number;
  };
  createPayment: (data: PaymentFormData) => Promise<boolean>;
  getPayments: (filters?: Record<string, any>) => Promise<void>;
  getPlans: () => Promise<void>;
  updatePayment: (id: number, data: Partial<Payment>) => Promise<boolean>;
  deletePayment: (id: number) => Promise<boolean>;
  approvePayment: (id: number) => Promise<boolean>;
  rejectPayment: (id: number, reason: string) => Promise<boolean>;
  setFilters: (filters: Partial<any>) => void;
}

const useSyndicSubscriptionPayments = (): UsePaymentsReturn => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState({
    status: "",
    payment_method: "",
    searchTerm: "",
  });

  // Calculate stats from payments
  const calculateStats = () => {
    const completedPayments = payments.filter(
      (p) => p.status === "COMPLETED",
    ).length;
    const pendingPayments = payments.filter(
      (p) => p.status === "PENDING",
    ).length;
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalRevenue,
      completedPayments,
      pendingPayments,
    };
  };

  const [stats, setStats] = useState(calculateStats());

  // Fetch subscription plans
  const getPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get("/syndic/subscription-plans/");
      setPlans(response.data.results || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch subscription plans",
      );
      console.error("Error fetching plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const setFilters = (newFilters: Partial<any>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  // Fetch data on mount
  useEffect(() => {
    getPayments();
    getPlans();
  }, []);

  // Fetch payments
  const getPayments = async (filters?: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.append(key, value.toString());
        }
      });

      const response = await axiosInstance.get(
        `/syndic/payments/?${params.toString()}`,
      );

      setPayments(response.data.results || []);
      setStats(calculateStats()); // Update stats when payments change
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch payments");
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new payment
  const createPayment = async (data: PaymentFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("amount", data.amount);
      formData.append("payment_method", data.payment_method);

      if (data.reference) formData.append("reference", data.reference);
      if (data.notes) formData.append("notes", data.notes);
      if (data.subscription_id)
        formData.append("subscription_id", data.subscription_id);
      if (data.rib) formData.append("rib", data.rib);
      if (data.payment_proof)
        formData.append("payment_proof", data.payment_proof);

      const response = await axiosInstance.post("/syndic/payments/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        await getPayments(); // Refresh payments list
        return true;
      } else {
        setError(response.data.message || "Failed to create payment");
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create payment");
      console.error("Error creating payment:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update payment
  const updatePayment = async (id: number, data: Partial<Payment>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.put(`/syndic/payments/${id}/`, data);

      if (response.data.success) {
        await getPayments(); // Refresh payments list to update stats
        return true;
      } else {
        setError(response.data.message || "Failed to update payment");
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update payment");
      console.error("Error updating payment:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete payment
  const deletePayment = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.delete(`/syndic/payments/${id}/`);

      if (response.data.success) {
        await getPayments(); // Refresh payments list to update stats
        return true;
      } else {
        setError(response.data.message || "Failed to delete payment");
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete payment");
      console.error("Error deleting payment:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Approve payment
  const approvePayment = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.post(
        `/syndic/payments/${id}/approve/`,
      );

      if (response.data.success) {
        await getPayments(); // Refresh payments list to update stats
        return true;
      } else {
        setError(response.data.message || "Failed to approve payment");
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve payment");
      console.error("Error approving payment:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reject payment
  const rejectPayment = async (id: number, reason: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.post(
        `/syndic/payments/${id}/reject/`,
        {
          reason,
        },
      );

      if (response.data.success) {
        await getPayments(); // Refresh payments list to update stats
        return true;
      } else {
        setError(response.data.message || "Failed to reject payment");
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject payment");
      console.error("Error rejecting payment:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    payments,
    plans,
    loading,
    error,
    filters,
    setFilters,
    stats,
    createPayment,
    getPayments,
    getPlans,
    updatePayment,
    deletePayment,
    approvePayment,
    rejectPayment,
  };
};

export default useSyndicSubscriptionPayments;
