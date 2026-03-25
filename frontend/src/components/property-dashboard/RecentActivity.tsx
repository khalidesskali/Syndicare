import { 
  Activity, 
  ChevronRight, 
  DollarSign, 
  UserPlus, 
  FileText, 
  Wrench,
  Bell
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "payment",
    title: "Rent Payment Received",
    description: "$2,400 from Sarah Johnson",
    time: "2 min ago",
    icon: DollarSign,
    color: "bg-primary/10 text-primary",
  },
  {
    id: 2,
    type: "tenant",
    title: "New Tenant Added",
    description: "Michael Chen - Unit 2A",
    time: "1 hour ago",
    icon: UserPlus,
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    id: 3,
    type: "maintenance",
    title: "Maintenance Completed",
    description: "AC repair at Unit 5B",
    time: "3 hours ago",
    icon: Wrench,
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    id: 4,
    type: "document",
    title: "Lease Signed",
    description: "Garden Villas - Unit 3A",
    time: "5 hours ago",
    icon: FileText,
    color: "bg-chart-4/10 text-chart-4",
  },
  {
    id: 5,
    type: "alert",
    title: "Lease Expiring Soon",
    description: "Unit 2A - 30 days remaining",
    time: "6 hours ago",
    icon: Bell,
    color: "bg-chart-5/10 text-chart-5",
  },
  {
    id: 6,
    type: "payment",
    title: "Rent Payment Received",
    description: "$1,650 from James Wilson",
    time: "8 hours ago",
    icon: DollarSign,
    color: "bg-primary/10 text-primary",
  },
];

export function RecentActivity() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          Recent Activity
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="relative flex items-start gap-3 pl-1">
                  <div className={cn(
                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    activity.color
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
