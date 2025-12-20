import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, Calendar } from "lucide-react";

interface ComplaintFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  priorityFilter: string;
  onPriorityChange: (value: string) => void;
  buildingFilter: string;
  onBuildingChange: (value: string) => void;
  dateRange?: { from?: Date; to?: Date } | undefined;
  onDateRangeChange: (range?: { from?: Date; to?: Date }) => void;
  onSearch: () => void;
}

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected" },
];

const priorityOptions = [
  { value: "all", label: "All Priorities" },
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const buildingOptions = [
  { value: "all", label: "All Buildings" },
  { value: "1", label: "Building A" },
  { value: "2", label: "Building B" },
  { value: "3", label: "Building C" },
];

export function ComplaintFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  buildingFilter,
  onBuildingChange,
  dateRange,
  onDateRangeChange,
  onSearch,
}: ComplaintFiltersProps) {
  const hasActiveFilters =
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    buildingFilter !== "all" ||
    dateRange;

  const clearFilters = () => {
    onStatusChange("all");
    onPriorityChange("all");
    onBuildingChange("all");
    onDateRangeChange(undefined);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search complaints by title, content, or resident email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-slate-200 focus:border-orange-500 focus:ring-orange-500"
              onKeyPress={(e) => e.key === "Enter" && onSearch()}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[150px] border-slate-200 focus:border-orange-500 focus:ring-orange-500">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={onPriorityChange}>
            <SelectTrigger className="w-[150px] border-slate-200 focus:border-orange-500 focus:ring-orange-500">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={buildingFilter} onValueChange={onBuildingChange}>
            <SelectTrigger className="w-[150px] border-slate-200 focus:border-orange-500 focus:ring-orange-500">
              <SelectValue placeholder="Building" />
            </SelectTrigger>
            <SelectContent>
              {buildingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={onSearch}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
              Status:{" "}
              {statusOptions.find((o) => o.value === statusFilter)?.label}
            </Badge>
          )}
          {priorityFilter !== "all" && (
            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
              Priority:{" "}
              {priorityOptions.find((o) => o.value === priorityFilter)?.label}
            </Badge>
          )}
          {buildingFilter !== "all" && (
            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
              Building:{" "}
              {buildingOptions.find((o) => o.value === buildingFilter)?.label}
            </Badge>
          )}
          {dateRange && (
            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
              <Calendar className="h-3 w-3 mr-1" />
              Date Range Applied
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
