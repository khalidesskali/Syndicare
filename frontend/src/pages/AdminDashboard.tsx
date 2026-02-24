import React, { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Users, CheckCircle2, DollarSign, Clock } from "lucide-react";
import axiosInstance from "@/api/axios";
import type { AdminDashboardResponse } from "@/types/admin";

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminDashboardResponse["data"] | null>(
    null,
  );

  useEffect(() => {
    const getStats = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/admin/dashboard/");
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (e: unknown) {
        console.error("Failed to fetch dashboard data:", e);
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Dashboard Overview 📊
        </h2>
        <p className="text-slate-600">
          Monitor your platform's performance and key metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Syndics */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">
            {stats?.overview.total_syndics ?? "--"}
          </h3>
          <p className="text-sm text-slate-600">Total Syndics</p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              +{stats?.overview.syndics_this_month ?? "--"} this month
            </p>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">
            {stats?.overview.active_subscriptions ?? "--"}
          </h3>
          <p className="text-sm text-slate-600">Active Subscriptions</p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              {stats?.overview.conversion_rate ?? "--"}% conversion rate
            </p>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">
            {stats?.overview.monthly_revenue
              ? `${stats.overview.monthly_revenue.toLocaleString()} MAD`
              : "--"}
          </h3>
          <p className="text-sm text-slate-600">Monthly Revenue</p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p
              className={`text-xs ${
                stats?.overview.revenue_change &&
                stats.overview.revenue_change >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stats?.overview.revenue_change !== undefined
                ? `${
                    stats.overview.revenue_change >= 0 ? "+" : ""
                  }${stats.overview.revenue_change.toLocaleString()} MAD`
                : "--"}{" "}
              this month
            </p>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">
            {stats?.overview.pending_payments ?? "--"}
          </h3>
          <p className="text-sm text-slate-600">Pending Payments</p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              {stats?.overview.pending_payments_total
                ? `${stats.overview.pending_payments_total.toLocaleString()} MAD`
                : "--"}{" "}
              total
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Syndics */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Syndics
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {stats?.recent_syndics?.slice(0, 4).map((syndic, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {syndic.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{syndic.name}</p>
                    <p className="text-sm text-slate-600">{syndic.time_ago}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      syndic.status
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {syndic.status ? "Active" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Payments
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {stats?.recent_payments?.slice(0, 4).map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {payment.plan
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{payment.plan}</p>
                    <p className="text-sm text-slate-600">
                      {payment.amount} MAD
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      payment.status
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {payment.status ? "Paid" : "Pending"}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {payment.time_ago}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
