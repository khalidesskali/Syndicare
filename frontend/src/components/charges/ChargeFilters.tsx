import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useState } from "react";

interface ChargeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  dateRange: { from?: Date; to?: Date } | undefined;
  onDateRangeChange: (range: { from?: Date; to?: Date } | undefined) => void;
  onSearch: () => void;
}

export function ChargeFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  onSearch,
}: ChargeFiltersProps) {
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search charges..."
            className="w-full pl-10 border-slate-200 focus:border-green-500 focus:ring-green-500 bg-slate-50"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
        </div>

        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[200px] border-slate-200 focus:border-green-500 focus:ring-green-500 bg-slate-50">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Button
                variant="outline"
                className="w-[140px] border-slate-200 focus:border-green-500 focus:ring-green-500 bg-slate-50 text-sm justify-start text-left font-normal"
                onClick={() => setShowStartCalendar(!showStartCalendar)}
              >
                {dateRange?.from
                  ? format(dateRange.from, "MMM dd, yyyy")
                  : "Start date"}
              </Button>
              {showStartCalendar && (
                <div className="fixed z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                  <Calendar
                    mode="single"
                    selected={dateRange?.from}
                    onSelect={(date) => {
                      onDateRangeChange({ from: date, to: dateRange?.to });
                      setShowStartCalendar(false);
                    }}
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
            <span className="text-slate-400 text-sm">to</span>
            <div className="relative">
              <Button
                variant="outline"
                className="w-[140px] border-slate-200 focus:border-green-500 focus:ring-green-500 bg-slate-50 text-sm justify-start text-left font-normal"
                onClick={() => setShowEndCalendar(!showEndCalendar)}
              >
                {dateRange?.to
                  ? format(dateRange.to, "MMM dd, yyyy")
                  : "End date"}
              </Button>
              {showEndCalendar && (
                <div className="fixed z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                  <Calendar
                    mode="single"
                    selected={dateRange?.to}
                    onSelect={(date) => {
                      onDateRangeChange({ from: dateRange?.from, to: date });
                      setShowEndCalendar(false);
                    }}
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
