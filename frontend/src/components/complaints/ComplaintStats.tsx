import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import type { ComplaintStats } from "../../types/complaint";

interface ComplaintStatsProps {
  stats: ComplaintStats;
}

export function ComplaintStats({ stats }: ComplaintStatsProps) {
  const statCards = [
    {
      title: "Total Complaints",
      value: stats.total,
      icon: MessageSquare,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "In Progress",
      value: stats.in_progress,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const priorityStats = [
    {
      title: "Urgent",
      value: stats.by_priority.urgent,
      color: "text-red-600",
      bgColor: "bg-red-100",
      icon: AlertTriangle,
    },
    {
      title: "High",
      value: stats.by_priority.high,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      icon: AlertTriangle,
    },
    {
      title: "Medium",
      value: stats.by_priority.medium,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      icon: AlertTriangle,
    },
    {
      title: "Low",
      value: stats.by_priority.low,
      color: "text-green-600",
      bgColor: "bg-green-100",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="mb-8 space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Priority Stats */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          By Priority
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {priorityStats.map((stat, index) => (
            <Card key={index} className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor} mr-3`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {stat.title}
                    </p>
                    <p className="text-xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
