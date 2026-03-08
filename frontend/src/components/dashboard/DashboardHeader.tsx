import { RefreshCw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  onRefreshData?: () => void;
  loading?: boolean;
}

export function DashboardHeader({
  onRefreshData,
  loading = false,
}: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="relative">
        {/* Gradient accent background */}
        <div className="absolute inset-0 h-32 bg-gradient-to-br from-emerald-50 via-slate-50 to-transparent rounded-3xl -z-10" />

        <div className="pt-2">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Icon badge */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>

              <div>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                      Syndic Dashboard
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                      Manage your properties, residents, and community services
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Refresh button */}
            {onRefreshData && (
              <Button
                onClick={onRefreshData}
                disabled={loading}
                variant="outline"
                size="lg"
                className={cn(
                  "rounded-xl border-slate-200 hover:border-emerald-300 hover:bg-emerald-50",
                  "hover:text-emerald-700 transition-all duration-200 shrink-0",
                  loading && "opacity-50 cursor-not-allowed",
                )}
              >
                <RefreshCw
                  className={cn("w-4 h-4 mr-2", loading && "animate-spin")}
                />
                {loading ? "Refreshing..." : "Refresh Data"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
