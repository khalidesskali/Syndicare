import { Users, ChevronRight, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tenants = [
  {
    id: 1,
    name: "Sarah Johnson",
    unit: "Unit 4B",
    property: "Sunset Apartments",
    rent: "$1,800",
    status: "Current",
    initials: "SJ",
  },
  {
    id: 2,
    name: "Michael Chen",
    unit: "Unit 2A",
    property: "Marina Heights",
    rent: "$2,200",
    status: "Current",
    initials: "MC",
  },
  {
    id: 3,
    name: "Emily Davis",
    unit: "Unit 7C",
    property: "Downtown Lofts",
    rent: "$1,950",
    status: "Late",
    initials: "ED",
  },
  {
    id: 4,
    name: "James Wilson",
    unit: "Unit 3A",
    property: "Parkview Residences",
    rent: "$1,650",
    status: "Current",
    initials: "JW",
  },
];

const avatarColors = [
  "bg-chart-1/20 text-chart-1",
  "bg-chart-2/20 text-chart-2",
  "bg-chart-3/20 text-chart-3",
  "bg-chart-4/20 text-chart-4",
];

export function TenantOverview() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          Recent Tenants
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {tenants.map((tenant, index) => (
          <div
            key={tenant.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <Avatar className={cn("h-10 w-10", avatarColors[index % avatarColors.length])}>
              <AvatarFallback className="text-sm font-semibold bg-transparent">
                {tenant.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground truncate">{tenant.name}</p>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs ml-2",
                    tenant.status === "Current"
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {tenant.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {tenant.unit} · {tenant.property}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs font-medium text-foreground">{tenant.rent}/mo</p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                    <Mail className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                    <Phone className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
