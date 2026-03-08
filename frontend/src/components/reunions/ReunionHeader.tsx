import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ReunionHeaderProps {
  onCreateReunion: () => void;
  onScheduleMultiple: () => void;
  loading?: boolean;
}

export function ReunionHeader({
  onCreateReunion,
  onScheduleMultiple,
  loading = false,
}: ReunionHeaderProps) {
  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Reunions Management
          </h2>
          <p className="text-slate-600 mt-1">
            Schedule and manage community reunions and meetings
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={onScheduleMultiple}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          >
            <Calendar className="mr-2 h-4 w-4" /> Schedule Multiple
          </Button>
          <Button
            onClick={onCreateReunion}
            className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> New Reunion
          </Button>
        </div>
      </div>
    </div>
  );
}
