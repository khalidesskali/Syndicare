import { 
  Plus, 
  UserPlus, 
  FileText, 
  Wrench, 
  DollarSign,
  Calendar,
  Send,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "Add Property",
    description: "List a new property",
    icon: Plus,
    color: "bg-primary/10 text-primary hover:bg-primary/20",
    primary: true,
  },
  {
    label: "Add Tenant",
    description: "Register new tenant",
    icon: UserPlus,
    color: "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20",
  },
  {
    label: "Create Lease",
    description: "Generate lease document",
    icon: FileText,
    color: "bg-chart-3/10 text-chart-3 hover:bg-chart-3/20",
  },
  {
    label: "New Request",
    description: "Log maintenance issue",
    icon: Wrench,
    color: "bg-chart-5/10 text-chart-5 hover:bg-chart-5/20",
  },
  {
    label: "Record Payment",
    description: "Log rent payment",
    icon: DollarSign,
    color: "bg-chart-1/10 text-chart-1 hover:bg-chart-1/20",
  },
  {
    label: "Schedule",
    description: "Add event or inspection",
    icon: Calendar,
    color: "bg-chart-4/10 text-chart-4 hover:bg-chart-4/20",
  },
  {
    label: "Send Notice",
    description: "Communicate with tenants",
    icon: Send,
    color: "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20",
  },
  {
    label: "View Reports",
    description: "Financial analytics",
    icon: BarChart3,
    color: "bg-primary/10 text-primary hover:bg-primary/20",
  },
];

export function QuickActions() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="ghost"
                className={cn(
                  "h-auto flex-col gap-2 p-4 rounded-xl transition-all",
                  action.color,
                  action.primary && "ring-1 ring-primary/20"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold">{action.label}</p>
                  <p className="text-[10px] opacity-70 hidden sm:block">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
