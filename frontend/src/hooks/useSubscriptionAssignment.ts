import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

interface Syndic {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  syndic_profile?: {
    subscription?: {
      id: number;
      plan: {
        id: number;
        name: string;
        price: string;
        duration_days: number;
      };
      start_date: string;
      end_date: string;
      status: string;
      days_remaining: number;
      is_active: boolean;
    };
  };
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

interface AssignmentFormData {
  syndic_id: number;
  plan_id: number;
  start_date?: string;
}

interface UseSubscriptionAssignmentReturn {
  syndics: Syndic[];
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  assignSubscription: (data: AssignmentFormData) => Promise<boolean>;
  getSyndicsWithSubscriptions: () => Promise<void>;
  getSubscriptionPlans: () => Promise<void>;
}

const useSubscriptionAssignment = (): UseSubscriptionAssignmentReturn => {
  const [syndics, setSyndics] = useState<Syndic[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch syndics with their subscription status
  const getSyndicsWithSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        "/admin/subscription-assignment/syndics_with_subscriptions/"
      );

      if (response.data.success) {
        setSyndics(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch syndics");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch syndics");
      console.error("Error fetching syndics:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription plans
  const getSubscriptionPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        "/admin/subscription-plans/?is_active=true"
      );

      if (response.data.success) {
        setPlans(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch subscription plans");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch subscription plans"
      );
      console.error("Error fetching subscription plans:", err);
    } finally {
      setLoading(false);
    }
  };

  // Assign subscription to syndic
  const assignSubscription = async (data: AssignmentFormData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.post(
        "/admin/subscription-assignment/assign_subscription/",
        data
      );

      if (response.data.success) {
        await getSyndicsWithSubscriptions(); // Refresh syndics list
        return true;
      } else {
        setError(response.data.message || "Failed to assign subscription");
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign subscription");
      console.error("Error assigning subscription:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    getSyndicsWithSubscriptions();
    getSubscriptionPlans();
  }, []);

  return {
    syndics,
    plans,
    loading,
    error,
    assignSubscription,
    getSyndicsWithSubscriptions,
    getSubscriptionPlans,
  };
};

export default useSubscriptionAssignment;
