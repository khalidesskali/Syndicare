import { Calendar, Clock, Building, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReunionStats } from "../../types/reunion";

interface ReunionStatsProps {
  stats: ReunionStats | null;
  loading?: boolean;
}

export function ReunionStats({ stats, loading = false }: ReunionStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.total_reunions || 0}
        </div>
        <p className="text-sm text-slate-600">Total Reunions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Clock className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.upcoming_reunions || 0}
        </div>
        <p className="text-sm text-slate-600">Scheduled</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.completed_reunions || 0}
        </div>
        <p className="text-sm text-slate-600">Completed</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.average_attendance || 0}%
        </div>
        <p className="text-sm text-slate-600">Completion Rate</p>
      </div>
    </div>
  );
}
