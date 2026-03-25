import { Wrench, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const requests = [
  {
    id: 1,
    title: "Plumbing Issue",
    unit: "Unit 4B - Sunset Apartments",
    priority: "High",
    status: "In Progress",
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "HVAC Maintenance",
    unit: "Unit 2A - Marina Heights",
    priority: "Medium",
    status: "Pending",
    time: "5 hours ago",
  },
  {
    id: 3,
    title: "Electrical Repair",
    unit: "Unit 7C - Downtown Lofts",
    priority: "High",
    status: "Pending",
    time: "1 day ago",
  },
  {
    id: 4,
    title: "Window Replacement",
    unit: "Unit 3A - Parkview Residences",
    priority: "Low",
    status: "Scheduled",
    time: "2 days ago",
  },
  {
    id: 5,
    title: "Appliance Repair",
    unit: "Unit 5B - Garden Villas",
    priority: "Medium",
    status: "In Progress",
    time: "3 days ago",
  },
];

const priorityColors = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
};

const statusColors = {
  "In Progress": "bg-primary/10 text-primary",
  "Pending": "bg-chart-3/10 text-chart-3",
  "Scheduled": "bg-chart-2/10 text-chart-2",
};

export function MaintenanceRequests() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Wrench className="w-4 h-4 text-muted-foreground" />
          Maintenance Requests
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              request.priority === "High" ? "bg-destructive/10" : "bg-chart-3/10"
            )}>
              {request.priority === "High" ? (
                <AlertTriangle className="w-4 h-4 text-destructive" />
              ) : (
                <Wrench className="w-4 h-4 text-chart-3" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{request.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{request.unit}</p>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs shrink-0", priorityColors[request.priority as keyof typeof priorityColors])}
                >
                  {request.priority}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", statusColors[request.status as keyof typeof statusColors])}
                >
                  {request.status}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {request.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
