import {
  Building,
  Users,
  DollarSign,
  Calendar,
  MessageSquare,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  stats: {
    overview: {
      total_buildings: number;
      buildings_this_month: number;
      total_residents: number;
      residents_this_month: number;
      pending_charges: number;
      upcoming_reunions: number;
      open_complaints: number;
      urgent_complaints: number;
    };
    financial: {
      monthly_revenue: number;
      revenue_change: number;
      total_monthly_charges: number;
      last_month_revenue: number;
    };
  };
  loading?: boolean;
}

export function DashboardStats({
  stats,
  loading = false,
}: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {[...Array(6)].map((_, idx) => (
          <Card key={idx} className="border-2 border-slate-100 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-16 h-6 rounded-lg" />
              </div>
              <div className="space-y-2 mb-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Separator className="mb-3" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-4/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Buildings",
      value: stats.overview.total_buildings,
      change: stats.overview.buildings_this_month,
      changeLabel: "added this month",
      icon: Building,
      gradient: "from-emerald-500 to-emerald-700",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: stats.overview.buildings_this_month > 0 ? "up" : "neutral",
    },
    {
      title: "Total Residents",
      value: stats.overview.total_residents,
      change: stats.overview.residents_this_month,
      changeLabel: "new this month",
      icon: Users,
      gradient: "from-blue-500 to-blue-700",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: stats.overview.residents_this_month > 0 ? "up" : "neutral",
    },
    {
      title: "Pending Charges",
      value: stats.overview.pending_charges,
      change: stats.financial.total_monthly_charges,
      changeLabel: "total value",
      changePrefix: "",
      changeSuffix: " DH",
      icon: DollarSign,
      gradient: "from-amber-500 to-amber-700",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      trend: "neutral",
    },
    {
      title: "Upcoming Reunions",
      value: stats.overview.upcoming_reunions,
      change: "Next in 3 days",
      changeLabel: "",
      icon: Calendar,
      gradient: "from-violet-500 to-violet-700",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      trend: "neutral",
    },
    {
      title: "Open Complaints",
      value: stats.overview.open_complaints,
      change: stats.overview.urgent_complaints,
      changeLabel: "urgent",
      icon: MessageSquare,
      gradient: "from-red-500 to-red-700",
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      trend: stats.overview.urgent_complaints > 0 ? "alert" : "neutral",
    },
    {
      title: "Monthly Revenue",
      value: `${stats.financial.monthly_revenue.toLocaleString()} DH`,
      change: stats.financial.revenue_change,
      changeLabel: "vs last month",
      changeSuffix: "%",
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-700",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: stats.financial.revenue_change >= 0 ? "up" : "down",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon;
        const isPositive = stat.trend === "up";
        const isNegative = stat.trend === "down";
        const isAlert = stat.trend === "alert";
        const TrendIcon = isPositive
          ? ArrowUpRight
          : isNegative
            ? ArrowDownRight
            : null;

        return (
          <Card
            key={idx}
            className={cn(
              "relative overflow-hidden border-2 transition-all duration-300",
              "hover:shadow-xl hover:-translate-y-1",
              "border-slate-100 shadow-md",
            )}
            style={{
              animationDelay: `${idx * 80}ms`,
              animation: "slideUp 0.5s ease-out both",
            }}
          >
            {/* Subtle gradient overlay */}
            <div
              className={cn(
                "absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full blur-3xl",
                `bg-gradient-to-br ${stat.gradient}`,
              )}
            />

            <CardContent className="p-6 relative">
              {/* Icon and Trend Badge */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    stat.iconBg,
                  )}
                >
                  <Icon
                    className={cn("w-6 h-6", stat.iconColor)}
                    strokeWidth={2}
                  />
                </div>
                {TrendIcon && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "flex items-center gap-1 px-2 py-1",
                      isPositive &&
                        "bg-emerald-100 text-emerald-700 border-emerald-200",
                      isNegative && "bg-red-100 text-red-700 border-red-200",
                    )}
                  >
                    <TrendIcon className="w-3 h-3" />
                    <span className="text-xs font-semibold">
                      {typeof stat.change === "number"
                        ? (isPositive ? "+" : "") + stat.change
                        : ""}
                      {stat.changeSuffix || ""}
                    </span>
                  </Badge>
                )}
              </div>

              {/* Value */}
              <div className="space-y-1 mb-4">
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {stat.value}
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>
              </div>

              <Separator className="mb-3" />

              {/* Footer info */}
              <div className="flex items-center gap-2 text-xs">
                {isAlert && (
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                )}
                <span
                  className={cn(
                    "font-semibold",
                    isPositive && "text-emerald-600",
                    isNegative && "text-red-600",
                    isAlert && "text-red-600",
                    stat.trend === "neutral" && !isAlert && "text-slate-600",
                  )}
                >
                  {stat.changePrefix}
                  {typeof stat.change === "number"
                    ? stat.change.toLocaleString()
                    : stat.change}
                  {stat.changeSuffix || ""}
                </span>
                {stat.changeLabel && (
                  <span className="text-slate-400">{stat.changeLabel}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
