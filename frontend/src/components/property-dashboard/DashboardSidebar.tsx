import { 
  Home, 
  Building2, 
  Users, 
  Wrench, 
  DollarSign, 
  Calendar, 
  FileText, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  { icon: Home, label: "Overview", href: "#", active: true },
  { icon: Building2, label: "Properties", href: "#" },
  { icon: Users, label: "Tenants", href: "#" },
  { icon: Wrench, label: "Maintenance", href: "#", badge: 5 },
  { icon: DollarSign, label: "Financials", href: "#" },
  { icon: Calendar, label: "Calendar", href: "#" },
  { icon: FileText, label: "Documents", href: "#" },
];

const bottomNavItems = [
  { icon: Settings, label: "Settings", href: "#" },
  { icon: HelpCircle, label: "Help & Support", href: "#" },
];

export function DashboardSidebar({ isOpen, onToggle }: DashboardSidebarProps) {
  return (
    <TooltipProvider>
      {/* Mobile Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onToggle}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 h-full flex flex-col bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300",
          isOpen ? "w-64" : "w-20",
          "max-md:translate-x-0",
          !isOpen && "max-md:-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <h1 className="text-base font-bold text-foreground tracking-tight">SyndiCare</h1>
                <p className="text-xs text-muted-foreground">Property Manager</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onToggle}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {isOpen && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Main Menu
            </p>
          )}
          {mainNavItems.map((item) => (
            <NavItem 
              key={item.label} 
              item={item} 
              collapsed={!isOpen} 
            />
          ))}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* Bottom Navigation */}
        <div className="py-4 px-3 space-y-1">
          {bottomNavItems.map((item) => (
            <NavItem 
              key={item.label} 
              item={item} 
              collapsed={!isOpen} 
            />
          ))}
        </div>

        {/* User Section */}
        {isOpen && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">Admin</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}

interface NavItemProps {
  item: {
    icon: React.ElementType;
    label: string;
    href: string;
    active?: boolean;
    badge?: number;
  };
  collapsed: boolean;
}

function NavItem({ item, collapsed }: NavItemProps) {
  const Icon = item.icon;
  
  const content = (
    <a
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
        collapsed && "justify-center",
        item.active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0", item.active && "text-primary")} />
      {!collapsed && (
        <>
          <span className={cn("flex-1 text-sm font-medium", item.active && "font-semibold")}>
            {item.label}
          </span>
          {item.badge && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-destructive text-destructive-foreground">
              {item.badge}
            </span>
          )}
        </>
      )}
    </a>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-destructive text-destructive-foreground">
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
