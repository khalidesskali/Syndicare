import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const occupancyData = [
  { property: "Sunset Apartments", occupied: 18, total: 20, rate: 90 },
  { property: "Marina Heights", occupied: 12, total: 12, rate: 100 },
  { property: "Downtown Lofts", occupied: 8, total: 10, rate: 80 },
  { property: "Parkview Residences", occupied: 14, total: 16, rate: 87.5 },
  { property: "Garden Villas", occupied: 6, total: 8, rate: 75 },
];

export function OccupancyChart() {
  const totalOccupied = occupancyData.reduce((sum, p) => sum + p.occupied, 0);
  const totalUnits = occupancyData.reduce((sum, p) => sum + p.total, 0);
  const overallRate = Math.round((totalOccupied / totalUnits) * 100);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            Occupancy Rates
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </CardTitle>
          <CardDescription>Current occupancy by property</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{overallRate}%</span>
              <span className="text-sm text-muted-foreground">overall</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {totalOccupied} of {totalUnits} units occupied
            </p>
          </div>
          
          {/* Mini Donut */}
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                className="stroke-secondary"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                className="stroke-primary"
                strokeWidth="3"
                strokeDasharray={`${overallRate * 0.88} 88`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-foreground">{overallRate}%</span>
            </div>
          </div>
        </div>

        {/* Property List */}
        <div className="space-y-4">
          {occupancyData.map((property) => (
            <div key={property.property}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground truncate flex-1">
                  {property.property}
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  {property.occupied}/{property.total}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Progress 
                  value={property.rate} 
                  className={cn(
                    "h-2 flex-1",
                    property.rate === 100 ? "[&>div]:bg-primary" : 
                    property.rate >= 85 ? "[&>div]:bg-chart-1" : 
                    property.rate >= 70 ? "[&>div]:bg-chart-3" : "[&>div]:bg-chart-5"
                  )}
                />
                <span className={cn(
                  "text-sm font-medium w-12 text-right",
                  property.rate === 100 ? "text-primary" : 
                  property.rate >= 85 ? "text-chart-1" : 
                  property.rate >= 70 ? "text-chart-3" : "text-chart-5"
                )}>
                  {property.rate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
