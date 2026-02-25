import React, { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import axiosInstance from "@/api/axios";
import type { AdminDashboardResponse } from "@/types/admin";
import AdminDashboardHeader from "@/components/admin/dashboard/AdminDashboardHeader";
import Stats from "@/components/admin/dashboard/Stats";
import RecentSyndics from "@/components/admin/dashboard/RecentSyndics";
import RecentPayments from "@/components/admin/dashboard/RecentPayments";

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
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
            <div
              className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"
              style={{ animationDelay: "150ms" }}
            />
          </div>
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        <AdminDashboardHeader />

        {/* ── Stats Grid with Animations ── */}
        <Stats stats={stats} />

        {/* ── Activity Sections ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Syndics */}
          <RecentSyndics stats={stats} />

          {/* Recent Payments */}
          <RecentPayments stats={stats} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
