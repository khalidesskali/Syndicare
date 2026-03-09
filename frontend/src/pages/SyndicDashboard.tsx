import React from "react";
import { ErrorMessage } from "@/components/ui/error-message";
import { ErrorState } from "@/components/ui/error-state";
import { useSyndicDashboard } from "../hooks/useSyndicDashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { DashboardReunions } from "@/components/dashboard/DashboardReunions";

const SyndicDashboard: React.FC = () => {
  const {
    stats,
    loading,
    error,
    refreshData,
    handleAddBuilding,
    handleAddResident,
    handleCreateCharge,
    handleScheduleMeeting,
    clearError,
  } = useSyndicDashboard();

  if (error && !stats) {
    return (
      <ErrorState
        message={error}
        onRetry={refreshData}
        errorType={
          error.toLowerCase().includes("network") ||
          error.toLowerCase().includes("fetch")
            ? "network"
            : "server"
        }
      />
    );
  }

  return (
    <>
      {error && stats && <ErrorMessage message={error} onClose={clearError} />}
      <DashboardHeader onRefreshData={refreshData} loading={loading} />
      <DashboardStats
        stats={
          stats || {
            overview: {
              total_buildings: 0,
              buildings_this_month: 0,
              total_residents: 0,
              residents_this_month: 0,
              pending_charges: 0,
              upcoming_reunions: 0,
              open_complaints: 0,
              urgent_complaints: 0,
            },
            financial: {
              monthly_revenue: 0,
              revenue_change: 0,
              total_monthly_charges: 0,
              last_month_revenue: 0,
            },
          }
        }
        loading={loading}
      />
      <DashboardQuickActions
        onAddBuilding={handleAddBuilding}
        onAddResident={handleAddResident}
        onCreateCharge={handleCreateCharge}
        onScheduleMeeting={handleScheduleMeeting}
        loading={loading}
      />
      <DashboardReunions reunions={[]} loading={loading} />
    </>
  );
};

export default SyndicDashboard;
