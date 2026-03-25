import { Building2, Users, DollarSign, Wrench, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const stats = [
  {
    title: "Total Properties",
    value: "24",
    change: "+2",
    changeLabel: "from last month",
    trend: "up",
    icon: Building2,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  {
    title: "Active Tenants",
    value: "156",
    change: "+12",
    changeLabel: "new this month",
    trend: "up",
    icon: Users,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    title: "Monthly Revenue",
    value: "$48,250",
    change: "+8.5%",
    changeLabel: "vs last month",
    trend: "up",
    icon: DollarSign,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    title: "Pending Requests",
    value: "5",
    change: "-3",
    changeLabel: "from last week",
    trend: "down",
    icon: Wrench,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
];

export function OverviewStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
        const isPositive = stat.trend === "up" && !stat.title.includes("Pending");
        const isNegativeGood = stat.trend === "down" && stat.title.includes("Pending");
        
        return (
          <Card key={stat.title} className="border-border bg-card hover:bg-card/80 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={cn("p-2.5 rounded-xl", stat.bgColor)}>
                  <Icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  (isPositive || isNegativeGood) 
                    ? "bg-primary/10 text-primary" 
                    : "bg-destructive/10 text-destructive"
                )}>
                  <TrendIcon className="w-3 h-3" />
                  <span>{stat.change}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
              </div>
              
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                {stat.changeLabel}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
