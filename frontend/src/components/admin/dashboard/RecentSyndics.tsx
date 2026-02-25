import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import type { AdminDashboardResponse } from "@/types/admin";

const RecentSyndics: React.FC<{
  stats: AdminDashboardResponse["data"] | null;
}> = ({ stats }) => {
  return (
    <Card className="border-2 border-slate-100 shadow-md">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Recent Syndics
              </h3>
              <p className="text-xs text-slate-500">Latest registered users</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
          >
            View All
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <Separator />

        {/* List */}
        <div className="divide-y divide-slate-100">
          {stats?.recent_syndics?.slice(0, 5).map((syndic, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-200 shrink-0">
                  {syndic.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 truncate">
                    {syndic.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <p className="text-xs text-slate-500">{syndic.time_ago}</p>
                  </div>
                </div>
              </div>
              <Badge
                variant={syndic.status ? "default" : "secondary"}
                className={cn(
                  "text-xs font-medium shrink-0",
                  syndic.status
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-amber-100 text-amber-700 border-amber-200",
                )}
              >
                {syndic.status ? "Active" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {(!stats?.recent_syndics || stats.recent_syndics.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">No recent syndics</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSyndics;
