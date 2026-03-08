import React from "react";
import { AlertCircle } from "lucide-react";
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
      <div className="p-8">
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Error loading dashboard
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Error Display */}
      {error && stats && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Error refreshing data
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
