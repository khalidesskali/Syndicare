import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

// Simulated chart data
const chartData = [
  { month: "Jan", revenue: 35000, expenses: 12000 },
  { month: "Feb", revenue: 38000, expenses: 14000 },
  { month: "Mar", revenue: 42000, expenses: 11000 },
  { month: "Apr", revenue: 39000, expenses: 15000 },
  { month: "May", revenue: 45000, expenses: 13000 },
  { month: "Jun", revenue: 48250, expenses: 14500 },
];

const maxValue = Math.max(...chartData.map(d => d.revenue));

export function RevenueChart() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            Revenue Overview
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </CardTitle>
          <CardDescription>Monthly revenue and expenses</CardDescription>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-chart-1" />
            <span className="text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-chart-3" />
            <span className="text-muted-foreground">Expenses</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-3xl font-bold text-foreground">$48,250</span>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
            +8.5%
          </Badge>
        </div>

        {/* Chart Area */}
        <div className="h-48 flex items-end justify-between gap-2">
          {chartData.map((data, index) => (
            <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col gap-1 relative">
                {/* Revenue Bar */}
                <div
                  className="w-full bg-chart-1 rounded-t transition-all duration-500"
                  style={{
                    height: `${(data.revenue / maxValue) * 140}px`,
                    opacity: index === chartData.length - 1 ? 1 : 0.7,
                  }}
                />
                {/* Expense indicator line */}
                <div
                  className="absolute bottom-0 left-0 right-0 border-t-2 border-chart-3 border-dashed"
                  style={{
                    bottom: `${(data.expenses / maxValue) * 140}px`,
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground mt-2">{data.month}</span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue (YTD)</p>
            <p className="text-lg font-semibold text-foreground">$247,250</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Expenses (YTD)</p>
            <p className="text-lg font-semibold text-foreground">$79,500</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
