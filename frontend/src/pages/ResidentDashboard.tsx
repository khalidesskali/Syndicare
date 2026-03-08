import React from "react";
import { useAuth } from "../context/AuthContext";
import { useResidentDashboard } from "../hooks/useResidentDashboard";
import ResidentDashboardStats from "../components/dashboard/ResidentDashboardStats";
import ResidentRecentCharges from "../components/dashboard/ResidentRecentCharges";
import { AlertCircle } from "lucide-react";

const ResidentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, error } = useResidentDashboard();

  const dashboardData = data?.data || {
    total_unpaid: 0,
    overdue_charges: 0,
    last_payment: null,
    recent_charges: [],
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.first_name || "Resident"}!
          </h1>
          <p className="text-slate-600">
            Here's an overview of your charges and payments
          </p>
        </div>

        {/* Dashboard Stats */}
        <ResidentDashboardStats
          totalUnpaid={dashboardData.total_unpaid}
          overdueCharges={dashboardData.overdue_charges}
          lastPayment={dashboardData.last_payment}
          loading={loading}
        />

        {/* Recent Charges */}
        <ResidentRecentCharges
          charges={dashboardData.recent_charges}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ResidentDashboard;
