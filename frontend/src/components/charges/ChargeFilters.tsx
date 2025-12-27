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
import { useState, useRef, useEffect } from "react";

interface ChargeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  dateRange: { from?: Date; to?: Date } | undefined;
  onDateRangeChange: (range: { from?: Date; to?: Date } | undefined) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

export function ChargeFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  onSearch,
  onClearFilters,
}: ChargeFiltersProps) {
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const startCalendarRef = useRef<HTMLDivElement>(null);
  const endCalendarRef = useRef<HTMLDivElement>(null);

  // Close calendars when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        startCalendarRef.current &&
        !startCalendarRef.current.contains(event.target as Node)
      ) {
        setShowStartCalendar(false);
      }
      if (
        endCalendarRef.current &&
        !endCalendarRef.current.contains(event.target as Node)
      ) {
        setShowEndCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          <Input
            type="search"
            placeholder="Search charges..."
            className="w-full pl-10 border-slate-200 focus:border-green-500 focus:ring-green-500 bg-green-50/50"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
        </div>

        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[200px] border-slate-200 focus:border-green-500 focus:ring-green-500 bg-green-50/50">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="hover:bg-green-50 focus:bg-green-50"
              >
                All Status
              </SelectItem>
              <SelectItem
                value="UNPAID"
                className="hover:bg-green-50 focus:bg-green-50"
              >
                Unpaid
              </SelectItem>
              <SelectItem
                value="PAID"
                className="hover:bg-green-50 focus:bg-green-50"
              >
                Paid
              </SelectItem>
              <SelectItem
                value="OVERDUE"
                className="hover:bg-green-50 focus:bg-green-50"
              >
                Overdue
              </SelectItem>
              <SelectItem
                value="PARTIALLY_PAID"
                className="hover:bg-green-50 focus:bg-green-50"
              >
                Partially Paid
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <div className="relative" ref={startCalendarRef}>
              <Button
                variant="outline"
                className="w-[140px] border-slate-200 focus:border-green-500 focus:ring-green-500 bg-green-50/50 text-sm justify-start text-left font-normal hover:bg-green-100"
                onClick={() => {
                  setShowStartCalendar(!showStartCalendar);
                  setShowEndCalendar(false);
                }}
              >
                {dateRange?.from
                  ? format(dateRange.from, "MMM dd, yyyy")
                  : "Start date"}
              </Button>
              {showStartCalendar && (
                <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
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
            <div className="relative" ref={endCalendarRef}>
              <Button
                variant="outline"
                className="w-[140px] border-slate-200 focus:border-green-500 focus:ring-green-500 bg-green-50/50 text-sm justify-start text-left font-normal hover:bg-green-100"
                onClick={() => {
                  setShowEndCalendar(!showEndCalendar);
                  setShowStartCalendar(false);
                }}
              >
                {dateRange?.to
                  ? format(dateRange.to, "MMM dd, yyyy")
                  : "End date"}
              </Button>
              {showEndCalendar && (
                <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
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

          <Button
            onClick={onSearch}
            className="bg-green-600 hover:bg-green-700 text-white px-6"
          >
            Search
          </Button>

          <Button
            onClick={onClearFilters}
            variant="outline"
            className="border-slate-200 hover:bg-slate-50 text-slate-600 px-6"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
