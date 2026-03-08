import { Search, Building, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApartmentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  buildingFilter: number | null;
  onBuildingChange: (value: number | null) => void;
  occupancyFilter: "all" | "occupied" | "vacant";
  onOccupancyChange: (value: "all" | "occupied" | "vacant") => void;
  onSearch: () => void;
  buildings?: { id: number; name: string }[];
  loading?: boolean;
}

export function ApartmentFilters({
  searchTerm,
  onSearchChange,
  buildingFilter,
  onBuildingChange,
  occupancyFilter,
  onOccupancyChange,
  onSearch,
  buildings = [],
  loading = false,
}: ApartmentFiltersProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="w-full lg:w-64">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="w-full lg:w-48">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4" />
            <Input
              placeholder="Search apartments by number or building..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-slate-200 focus:border-green-500 focus:ring-green-500 bg-green-50/50"
              onKeyPress={(e) => e.key === "Enter" && onSearch()}
            />
          </div>
        </div>

        {/* Building Filter */}
        <div className="w-full lg:w-64">
          <Select
            value={buildingFilter?.toString() || "all"}
            onValueChange={(value) =>
              onBuildingChange(value === "all" ? null : parseInt(value))
            }
          >
            <SelectTrigger className="border-slate-200 focus:border-green-500 focus:ring-green-500 bg-green-50/50">
              <Building className="mr-2 h-4 w-4 text-green-500" />
              <SelectValue placeholder="All Buildings" />
            </SelectTrigger>
            <SelectContent className="focus:border-green-500 focus:ring-green-500">
              <SelectItem
                value="all"
                className="hover:bg-green-50 focus:bg-green-50"
              >
                All Buildings
              </SelectItem>
              {buildings.map((building) => (
                <SelectItem
                  key={building.id}
                  value={building.id.toString()}
                  className="hover:bg-green-50 focus:bg-green-50"
                >
                  {building.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Occupancy Filter */}
        <div className="w-full lg:w-48">
          <Select
            value={occupancyFilter}
            onValueChange={(value: "all" | "occupied" | "vacant") =>
              onOccupancyChange(value)
            }
          >
            <SelectTrigger className="border-slate-200 focus:border-green-500 focus:ring-green-500 bg-green-50/50">
              <Users className="mr-2 h-4 w-4 text-green-500" />
              <SelectValue placeholder="Occupancy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="hover:bg-green-50 focus:bg-green-50"
              >
                All Apartments
              </SelectItem>
              <SelectItem
                value="occupied"
                className="hover:bg-green-50 focus:bg-green-50"
              >
                Occupied
              </SelectItem>
              <SelectItem
                value="vacant"
                className="hover:bg-green-50 focus:bg-green-50"
              >
                Vacant
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
