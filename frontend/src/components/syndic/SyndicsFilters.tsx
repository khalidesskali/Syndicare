import React from "react";
import { Search, Filter } from "lucide-react";
import type { SyndicFilters } from "@/types/syndics";

interface SyndicsFiltersProps {
  filters: Partial<SyndicFilters>;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "active" | "inactive" | "all") => void;
}

const SyndicsFilters: React.FC<SyndicsFiltersProps> = ({
  filters,
  onSearchChange,
  onStatusChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          <select
            value={filters.status || "all"}
            onChange={(e) =>
              onStatusChange(e.target.value as "active" | "inactive" | "all")
            }
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SyndicsFilters;
