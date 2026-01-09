import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

interface Payment {
  id: number;
  amount: string;
  paymentMethod: "BANK_TRANSFER";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  reference?: string;
  notes?: string;
  paymentDate: string;
  paymentProof?: string;
  rib?: string;
  planName?: string;
  syndicName?: string;
  subscription: {
    id: number;
    plan: {
      name: string;
    };
    syndic_profile: {
      user: {
        email: string;
        first_name: string;
        last_name: string;
      };
    };
  };
  processed_by?: {
    email: string;
  };
}

interface PaymentFormData {
  subscription_id: number;
  amount: string;
  payment_method: "BANK_TRANSFER";
  reference?: string;
  notes?: string;
}

interface RevenueStats {
  total_revenue: string;
  total_payments: number;
  pending_amount: string;
  by_method: {
    CASH: string;
    BANK_TRANSFER: string;
  };
}

interface UseAdminPaymentsReturn {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  filters: any;
  setFilters: any;
  updatePaymentStatus: any;
  refundPayment: any;
  stats: any;
  createPayment: (data: PaymentFormData) => Promise<boolean>;
  getPayments: (filters?: Record<string, any>) => Promise<void>;
  processPayment: (
    id: number,
    action: "approve" | "reject",
    notes?: string
  ) => Promise<boolean>;
  getSyndicPayments: (syndicId: number) => Promise<Payment[]>;
  getRevenueStats: (
    startDate?: string,
    endDate?: string
  ) => Promise<RevenueStats | null>;
}

const useAdminPayments = (): UseAdminPaymentsReturn => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transform backend data to frontend format
  const transformPaymentData = (payment: any): Payment => ({
    ...payment,
    paymentMethod: payment.payment_method,
    paymentDate: payment.payment_date,
    paymentProof: payment.payment_proof,
    rib: payment.rib,
    planName: payment.plan_name,
    syndicName: payment.syndic_name,
  });

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
        `/admin/payments/?${params.toString()}`
      );

      const rawData = response.data.results || response.data.data || [];
      const transformedData = rawData.map(transformPaymentData);
      setPayments(transformedData);
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

      const response = await axiosInstance.post(
        "/admin/payments/create_payment/",
        data
      );

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

  // Process payment (approve/reject)
  const processPayment = async (
    id: number,
    action: "approve" | "reject",
    notes?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.post(
        `/admin/payments/${id}/process_payment/`,
        { action, notes }
      );

      if (response.data.success) {
        await getPayments(); // Refresh payments list
        return true;
      } else {
        setError(response.data.message || "Failed to process payment");
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to process payment");
      console.error("Error processing payment:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get payments for specific syndic
  const getSyndicPayments = async (syndicId: number): Promise<Payment[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        `/admin/payments/syndic_payments/?syndic_id=${syndicId}`
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        setError(response.data.message || "Failed to fetch syndic payments");
        return [];
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch syndic payments"
      );
      console.error("Error fetching syndic payments:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get revenue statistics
  const getRevenueStats = async (
    startDate?: string,
    endDate?: string
  ): Promise<RevenueStats | null> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const response = await axiosInstance.get(
        `/admin/payments/revenue_stats/?${params.toString()}`
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        setError(response.data.message || "Failed to fetch revenue stats");
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch revenue stats");
      console.error("Error fetching revenue stats:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refundPayment = async (paymentId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.post(
        `/admin/payments/${paymentId}/refund/`
      );

      if (response.data.success) {
        await getPayments(); // Refresh payments list
        return true;
      } else {
        setError(response.data.message || "Failed to refund payment");
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to refund payment");
      console.error("Error refunding payment:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalRevenue: payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount || "0"),
      0
    ),
    completedPayments: payments.filter((p) => p.status === "COMPLETED").length,
    pendingPayments: payments.filter((p) => p.status === "PENDING").length,
  };

  // Initial fetch
  useEffect(() => {
    getPayments();
  }, []);

  return {
    payments,
    loading,
    error,
    filters: {},
    setFilters: () => {},
    updatePaymentStatus: processPayment,
    refundPayment,
    stats,
    createPayment,
    getPayments,
    processPayment,
    getSyndicPayments,
    getRevenueStats,
  };
};

export default useAdminPayments;
