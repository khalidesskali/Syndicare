import { Home, AlertCircle, Users, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApartmentStats } from "../../types/apartment";

interface ApartmentStatsProps {
  stats: ApartmentStats | null;
  loading?: boolean;
}

export function ApartmentStats({
  stats,
  loading = false,
}: ApartmentStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2 text-right">
                <Skeleton className="h-8 w-20 ml-auto" />
                <Skeleton className="h-4 w-28 ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;
  const cards = [
    {
      title: "Total Apartments",
      value: stats.total_apartments.toString(),
      icon: Home,
      color: "bg-purple-100 text-purple-600 border-purple-200",
      bgColor: "bg-purple-50",
    },
    {
      title: "Occupied",
      value: stats.occupied_apartments.toString(),
      icon: Users,
      color: "bg-green-100 text-green-600 border-green-200",
      bgColor: "bg-green-50",
    },
    {
      title: "Vacant",
      value: stats.vacant_apartments.toString(),
      icon: AlertCircle,
      color: "bg-amber-100 text-amber-600 border-amber-200",
      bgColor: "bg-amber-50",
    },
    {
      title: "Unpaid Charges",
      value: `${stats.total_unpaid_charges.toLocaleString()} DH`,
      icon: DollarSign,
      color: "bg-red-100 text-red-600 border-red-200",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`h-12 w-12 rounded-lg ${card.color} flex items-center justify-center`}
            >
              <card.icon className="h-6 w-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                {card.value}
              </div>
              <div className="text-sm text-slate-600">{card.title}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
