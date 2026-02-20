import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

const API_BASE_URL = "http://localhost:8000/api";

export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  max_buildings: number;
  max_apartments: number;
  is_active: boolean;
  created_at: string;
  total_subscriptions?: number;
  active_subscriptions?: number;
}

const useSubscriptionPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState({
    status: "all",
  });

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}/admin/subscription-plans/`,
        );

        if (response.data.success) {
          setPlans(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "active" && plan.is_active) ||
      (filters.status === "inactive" && !plan.is_active);

    return matchesSearch && matchesStatus;
  });

  const togglePlanStatus = async (planId: number) => {
    try {
      const plan = plans.find((p) => p.id === planId);

      if (!plan) return;

      const endpoint = plan.is_active
        ? `${API_BASE_URL}/admin/subscription-plans/${planId}/deactivate/`
        : `${API_BASE_URL}/admin/subscription-plans/${planId}/activate/`;

      const response = await axiosInstance.post(endpoint, {});

      if (response.data.success) {
        // Update local state
        setPlans(
          plans.map((p) =>
            p.id === planId ? { ...p, is_active: !p.is_active } : p,
          ),
        );
      }
    } catch (error) {
      console.error("Error toggling plan status:", error);
    }
  };

  const deletePlan = async (planId: number) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        const response = await axiosInstance.delete(
          `${API_BASE_URL}/admin/subscription-plans/${planId}/`,
        );

        if (response.data.success) {
          setPlans(plans.filter((plan) => plan.id !== planId));
        }
      } catch (error) {
        console.error("Error deleting plan:", error);
      }
    }
  };

  const handleSubmitPlan = async (
    e: React.FormEvent,
    planData?: Partial<Plan>,
  ) => {
    e.preventDefault();

    try {
      if (editingPlan) {
        // Update existing plan
        const response = await axiosInstance.patch(
          `${API_BASE_URL}/admin/subscription-plans/${editingPlan.id}/`,
          planData,
        );

        if (response.data.success) {
          // Update local state
          setPlans(
            plans.map((p) =>
              p.id === editingPlan.id ? { ...p, ...response.data.data } : p,
            ),
          );
        }
      } else {
        // Create new plan
        const response = await axiosInstance.post(
          `${API_BASE_URL}/admin/subscription-plans/`,
          planData,
        );

        if (response.data.success) {
          setPlans([...plans, response.data.data]);
        }
      }

      setShowCreateModal(false);
      setEditingPlan(null);
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  };

  return {
    plans,
    setPlans,
    loading,
    setLoading,
    filters,
    showCreateModal,
    setShowCreateModal,
    editingPlan,
    deletePlan,
    setFilters,
    filteredPlans,
    searchTerm,
    setSearchTerm,
    setEditingPlan,
    togglePlanStatus,
    handleSubmitPlan,
  };
};

export default useSubscriptionPlans;
