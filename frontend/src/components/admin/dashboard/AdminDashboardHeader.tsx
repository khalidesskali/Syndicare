import React from "react";
import { Activity } from "lucide-react";

const AdminDashboardHeader: React.FC = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 h-32 bg-gradient-to-br from-blue-50 via-violet-50 to-transparent rounded-3xl -z-10" />
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 text-sm">
              Monitor your platform's performance and key metrics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHeader;
