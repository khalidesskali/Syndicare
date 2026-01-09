import { Search, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Filters {
  status: string;
  building_id: string;
  apartment_id: string;
  payment_method: string;
  searchTerm: string;
}

interface PaymentFiltersProps {
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  refreshPayments: () => void;
  loading: boolean;
}

export function PaymentFilters({
  filters,
  setFilters,
  refreshPayments,
  loading,
}: PaymentFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              className="pl-10"
              value={filters.searchTerm}
              onChange={(e) => setFilters({ searchTerm: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters({ status: value === "all" ? "" : value })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.payment_method || "all"}
              onValueChange={(value) =>
                setFilters({ payment_method: value === "all" ? "" : value })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={refreshPayments}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
