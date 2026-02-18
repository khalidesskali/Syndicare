import React from "react";
import SyndicLayout from "@/layouts/SyndicLayout";
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

  if (loading) {
    return (
      <SyndicLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </SyndicLayout>
    );
  }

  if (error) {
    return (
      <SyndicLayout>
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
      </SyndicLayout>
    );
  }

  if (!stats) {
    return (
      <SyndicLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">No dashboard data available</p>
        </div>
      </SyndicLayout>
    );
  }

  return (
    <SyndicLayout>
      {/* Error Display */}
      {error && (
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
      )}

      <DashboardHeader onRefreshData={refreshData} />
      <DashboardStats stats={stats} />
      <DashboardQuickActions
        onAddBuilding={handleAddBuilding}
        onAddResident={handleAddResident}
        onCreateCharge={handleCreateCharge}
        onScheduleMeeting={handleScheduleMeeting}
      />
      <DashboardReunions reunions={[]} loading={false} />
    </SyndicLayout>
  );
};

export default SyndicDashboard;
