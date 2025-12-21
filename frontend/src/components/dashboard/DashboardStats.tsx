import {
  Building,
  Users,
  DollarSign,
  Calendar,
  MessageSquare,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface DashboardStatsProps {
  stats: {
    overview: {
      total_buildings: number;
      buildings_this_month: number;
      total_residents: number;
      residents_this_month: number;
      pending_charges: number;
      upcoming_reunions: number;
      open_complaints: number;
      urgent_complaints: number;
    };
    financial: {
      monthly_revenue: number;
      revenue_change: number;
      total_monthly_charges: number;
      last_month_revenue: number;
    };
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {/* Total Buildings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Building className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.overview.total_buildings}
        </div>
        <p className="text-sm text-slate-600">Total Buildings</p>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            <TrendingUp className="inline h-3 w-3 mr-1" />
            {stats.overview.buildings_this_month} added this month
          </p>
        </div>
      </div>

      {/* Total Residents */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.overview.total_residents}
        </div>
        <p className="text-sm text-slate-600">Total Residents</p>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            <TrendingUp className="inline h-3 w-3 mr-1" />
            {stats.overview.residents_this_month} new this month
          </p>
        </div>
      </div>

      {/* Pending Charges */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-orange-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.overview.pending_charges}
        </div>
        <p className="text-sm text-slate-600">Pending Charges</p>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {stats.financial.total_monthly_charges.toLocaleString()} MAD total
          </p>
        </div>
      </div>

      {/* Upcoming Reunions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.overview.upcoming_reunions}
        </div>
        <p className="text-sm text-slate-600">Upcoming Reunions</p>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">Next one in 3 days</p>
        </div>
      </div>

      {/* Open Complaints */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.overview.open_complaints}
        </div>
        <p className="text-sm text-slate-600">Open Complaints</p>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-red-600">
            <AlertCircle className="inline h-3 w-3 mr-1" />
            {stats.overview.urgent_complaints} urgent
          </p>
        </div>
      </div>

      {/* Monthly Revenue */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.financial.monthly_revenue.toLocaleString()} MAD
        </div>
        <p className="text-sm text-slate-600">Monthly Revenue</p>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p
            className={`text-xs ${
              stats.financial.revenue_change >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            <TrendingUp className="inline h-3 w-3 mr-1" />
            {stats.financial.revenue_change >= 0 ? "+" : ""}
            {stats.financial.revenue_change}% from last month
          </p>
        </div>
      </div>
    </div>
  );
}
