import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ResidentsHeaderProps {
  onCreateResident: () => void;
  loading?: boolean;
}

export function ResidentsHeader({
  onCreateResident,
  loading = false,
}: ResidentsHeaderProps) {
  if (loading) {
    return (
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Residents Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your building residents and their information
        </p>
      </div>
      <button
        onClick={onCreateResident}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Resident
      </button>
    </div>
  );
}
