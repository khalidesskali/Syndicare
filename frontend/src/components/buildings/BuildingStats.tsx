import { Building as BuildingIcon, Home, Users } from "lucide-react";
import type { BuildingStats } from "../../types/building";

interface BuildingStatsProps {
  stats: BuildingStats;
}

export function BuildingStats({ stats }: BuildingStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <BuildingIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {stats.total_buildings}
            </p>
            <p className="text-sm text-slate-600">Total Buildings</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Home className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {stats.total_apartments}
            </p>
            <p className="text-sm text-slate-600">Total Apartments</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {stats.occupied_apartments}
            </p>
            <p className="text-sm text-slate-600">Occupied Units</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <BuildingIcon className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {stats.average_occupancy}%
            </p>
            <p className="text-sm text-slate-600">Avg Occupancy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
