import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Reunion {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  participants_count?: number;
}

interface DashboardReunionsProps {
  reunions: Reunion[];
  loading?: boolean;
}

export function DashboardReunions({
  reunions = [],
  loading = false,
}: DashboardReunionsProps) {
  if (loading) {
    return (
      <Card className="border-2 border-slate-100 shadow-md">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Separator />
            <div className="space-y-4 pt-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 p-4 border-l-4 border-slate-100"
                >
                  <Skeleton className="h-5 w-2/3" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reunions || reunions.length === 0) {
    return (
      <Card className="border-2 border-slate-100 shadow-md">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-violet-600" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Upcoming Meetings
                </h3>
                <p className="text-xs text-slate-500">Community reunions</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Upcoming Meetings
            </h3>
            <p className="text-sm text-slate-500 mb-4 text-center max-w-sm">
              Schedule your next community meeting to keep residents informed
            </p>
            <Button className="rounded-xl bg-violet-600 hover:bg-violet-700">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-100 shadow-md">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-violet-600" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Upcoming Meetings
              </h3>
              <p className="text-xs text-slate-500">
                {reunions.length} scheduled
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg"
          >
            View All
          </Button>
        </div>

        <Separator />

        {/* Meetings list */}
        <div className="divide-y divide-slate-100">
          {reunions.map((reunion, idx) => (
            <div
              key={reunion.id}
              className={cn(
                "p-4 px-6 hover:bg-slate-50/50 transition-all duration-200 group relative",
                "border-l-4 ml-6 border-transparent hover:border-violet-500",
              )}
              style={{
                animationDelay: `${idx * 100}ms`,
                animation: "slideIn 0.4s ease-out both",
              }}
            >
              {/* Status badge - floating */}
              <div className="absolute top-4 right-6">
                <Badge
                  variant={
                    reunion.status === "SCHEDULED" ? "default" : "secondary"
                  }
                  className={cn(
                    "text-xs font-medium",
                    reunion.status === "SCHEDULED"
                      ? "bg-violet-100 text-violet-700 border-violet-200"
                      : "bg-slate-100 text-slate-600 border-slate-200",
                  )}
                >
                  {reunion.status}
                </Badge>
              </div>

              <div className="pr-24">
                {/* Title */}
                <h4 className="font-semibold text-slate-900 mb-3 group-hover:text-violet-700 transition-colors">
                  {reunion.title}
                </h4>

                {/* Metadata grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="font-medium">{reunion.date}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="font-medium">{reunion.time}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                    <span className="font-medium truncate">
                      {reunion.location}
                    </span>
                  </div>

                  {reunion.participants_count !== undefined && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <span className="font-medium">
                        {reunion.participants_count} participants
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
