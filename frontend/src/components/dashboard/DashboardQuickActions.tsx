import {
  Plus,
  Building,
  UserPlus,
  DollarSign,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardQuickActionsProps {
  onAddBuilding: () => void;
  onAddResident: () => void;
  onCreateCharge: () => void;
  onScheduleMeeting: () => void;
  loading?: boolean;
}

export function DashboardQuickActions({
  onAddBuilding,
  onAddResident,
  onCreateCharge,
  onScheduleMeeting,
  loading = false,
}: DashboardQuickActionsProps) {
  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <Card key={idx} className="border-2 border-slate-100 shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="w-11 h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="mt-4">
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const actions = [
    {
      label: "Add Building",
      description: "Register new property",
      icon: Building,
      onClick: onAddBuilding,
      gradient: "from-emerald-500 to-emerald-700",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      hoverBg: "hover:bg-emerald-50",
      hoverBorder: "hover:border-emerald-200",
    },
    {
      label: "Add Resident",
      description: "Register new tenant",
      icon: UserPlus,
      onClick: onAddResident,
      gradient: "from-blue-500 to-blue-700",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      hoverBg: "hover:bg-blue-50",
      hoverBorder: "hover:border-blue-200",
    },
    {
      label: "Create Charge",
      description: "Issue new payment",
      icon: DollarSign,
      onClick: onCreateCharge,
      gradient: "from-amber-500 to-amber-700",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      hoverBg: "hover:bg-amber-50",
      hoverBorder: "hover:border-amber-200",
    },
    {
      label: "Schedule Meeting",
      description: "Plan new reunion",
      icon: Calendar,
      onClick: onScheduleMeeting,
      gradient: "from-violet-500 to-violet-700",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      hoverBg: "hover:bg-violet-50",
      hoverBorder: "hover:border-violet-200",
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
          <p className="text-sm text-slate-500">Common tasks and shortcuts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, idx) => {
          const Icon = action.icon;

          return (
            <Card
              key={idx}
              className={cn(
                "group relative overflow-hidden cursor-pointer",
                "border-2 border-slate-100 transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1",
                action.hoverBorder,
              )}
              onClick={action.onClick}
              style={{
                animationDelay: `${idx * 80}ms`,
                animation: "fadeIn 0.5s ease-out both",
              }}
            >
              {/* Gradient overlay - subtle */}
              <div
                className={cn(
                  "absolute top-0 right-0 w-24 h-24 opacity-5 rounded-full blur-2xl",
                  `bg-gradient-to-br ${action.gradient}`,
                )}
              />

              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between mb-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center",
                      "transition-all duration-300 group-hover:scale-110",
                      action.iconBg,
                    )}
                  >
                    <Icon
                      className={cn("w-5 h-5", action.iconColor)}
                      strokeWidth={2.5}
                    />
                  </div>

                  {/* Plus icon - appears on hover */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      "opacity-0 group-hover:opacity-100 transition-all duration-300",
                      "bg-white shadow-sm border border-slate-200",
                    )}
                  >
                    <Plus
                      className="w-4 h-4 text-slate-600"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                    {action.label}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                {/* Arrow indicator - slides in on hover */}
                <div className="flex items-center gap-1 mt-3 text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-all duration-300">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Get started
                  </span>
                  <ArrowRight
                    className="w-3.5 h-3.5 transform translate-x-0 group-hover:translate-x-1 transition-transform"
                    strokeWidth={2.5}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
