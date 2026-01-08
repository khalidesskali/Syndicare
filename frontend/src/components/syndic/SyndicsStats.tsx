import React from "react";
import { Users, CheckCircle2, Clock } from "lucide-react";

interface SyndicsStatsProps {
  stats: {
    total_syndics: number;
    active_syndics: number;
    inactive_syndics: number;
    active_subscriptions: number;
  } | null;
}

const SyndicsStats: React.FC<SyndicsStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: "Total Syndics",
      value: stats?.total_syndics || 0,
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Active",
      value: stats?.active_syndics || 0,
      icon: CheckCircle2,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Inactive",
      value: stats?.inactive_syndics || 0,
      icon: Clock,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "With Valid Subscription",
      value: stats?.active_subscriptions || 0,
      icon: CheckCircle2,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div
              className={`h-12 w-12 ${card.bgColor} rounded-lg flex items-center justify-center`}
            >
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-sm text-slate-600">{card.title}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SyndicsStats;
