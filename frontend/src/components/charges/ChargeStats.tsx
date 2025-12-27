import { DollarSign, TrendingUp, FileText } from "lucide-react";
import type { ChargeStats } from "../../types/charge";

interface ChargeStatsProps {
  stats: ChargeStats;
}

export function ChargeStats({ stats }: ChargeStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.total_amount.toLocaleString()} DH
        </div>
        <p className="text-sm text-slate-600">All charges</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.paid_amount.toLocaleString()} DH
        </div>
        <p className="text-sm text-slate-600">Collected amount</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileText className="h-6 w-6 text-orange-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.unpaid_amount.toLocaleString()} DH
        </div>
        <p className="text-sm text-slate-600">Awaiting payment</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.collection_rate}%
        </div>
        <p className="text-sm text-slate-600">Current collection rate</p>
      </div>
    </div>
  );
}
