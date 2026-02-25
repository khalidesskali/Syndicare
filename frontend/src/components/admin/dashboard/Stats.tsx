import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  TrendingDown,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle2,
  Users,
} from "lucide-react";
import type { AdminDashboardResponse } from "@/types/admin";

const Stats: React.FC<{
  stats: AdminDashboardResponse["data"] | null;
}> = ({ stats }) => {
  const statCards = [
    {
      title: "Total Syndics",
      value: stats?.overview.total_syndics ?? "--",
      change: stats?.overview.syndics_this_month ?? 0,
      changeLabel: "new this month",
      icon: Users,
      gradient: "from-blue-500 to-blue-700",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: (stats?.overview.syndics_this_month ?? 0) > 0 ? "up" : "neutral",
    },
    {
      title: "Active Subscriptions",
      value: stats?.overview.active_subscriptions ?? "--",
      change: stats?.overview.conversion_rate ?? 0,
      changeLabel: "conversion rate",
      suffix: "%",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-emerald-700",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: "up",
    },
    {
      title: "Monthly Revenue",
      value: stats?.overview.monthly_revenue?.toLocaleString() ?? "--",
      valuePrefix: "",
      valueSuffix: " DH",
      change: stats?.overview.revenue_change ?? 0,
      changeLabel: "vs last month",
      changePrefix: "",
      changeSuffix: " DH",
      icon: DollarSign,
      gradient: "from-violet-500 to-violet-700",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      trend: (stats?.overview.revenue_change ?? 0) >= 0 ? "up" : "down",
    },
    {
      title: "Pending Payments",
      value: stats?.overview.pending_payments ?? "--",
      change: stats?.overview.pending_payments_total ?? 0,
      changeLabel: "total value",
      changePrefix: "",
      changeSuffix: " DH",
      icon: Clock,
      gradient: "from-amber-500 to-amber-700",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      trend: "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon;
        const isPositive = stat.trend === "up";
        const isNegative = stat.trend === "down";
        const TrendIcon = isPositive
          ? TrendingUp
          : isNegative
            ? TrendingDown
            : Activity;

        return (
          <Card
            key={idx}
            className={cn(
              "relative overflow-hidden border-2 transition-all duration-300",
              "hover:shadow-xl hover:-translate-y-1",
              "border-slate-100 shadow-md",
            )}
            style={{
              animationDelay: `${idx * 100}ms`,
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
              {/* Icon */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                    stat.iconBg,
                    "group-hover:scale-110",
                  )}
                >
                  <Icon
                    className={cn("w-6 h-6", stat.iconColor)}
                    strokeWidth={2}
                  />
                </div>
                {stat.trend !== "neutral" && (
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
                      {isPositive ? "+" : ""}
                      {stat.change}
                      {stat.suffix || ""}
                    </span>
                  </Badge>
                )}
              </div>

              {/* Value */}
              <div className="space-y-1 mb-4">
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {stat.valuePrefix}
                  {stat.value}
                  {stat.valueSuffix}
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>
              </div>

              <Separator className="mb-3" />

              {/* Footer info */}
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    "font-semibold",
                    isPositive && "text-emerald-600",
                    isNegative && "text-red-600",
                    stat.trend === "neutral" && "text-slate-600",
                  )}
                >
                  {stat.changePrefix}
                  {typeof stat.change === "number"
                    ? stat.change.toLocaleString()
                    : stat.change}
                  {stat.changeSuffix || ""}
                </span>
                <span className="text-slate-400">{stat.changeLabel}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Stats;
