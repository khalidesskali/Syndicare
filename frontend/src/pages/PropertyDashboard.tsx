import { useState } from "react";
import { DashboardSidebar } from "@/components/property-dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/property-dashboard/DashboardHeader";
import { OverviewStats } from "@/components/property-dashboard/OverviewStats";
import { RevenueChart } from "@/components/property-dashboard/RevenueChart";
import { OccupancyChart } from "@/components/property-dashboard/OccupancyChart";
import { PropertyTable } from "@/components/property-dashboard/PropertyTable";
import { MaintenanceRequests } from "@/components/property-dashboard/MaintenanceRequests";
import { RecentActivity } from "@/components/property-dashboard/RecentActivity";
import { TenantOverview } from "@/components/property-dashboard/TenantOverview";
import { QuickActions } from "@/components/property-dashboard/QuickActions";
import { cn } from "@/lib/utils";

export default function PropertyDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main
        className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:ml-64" : "md:ml-20"
        )}
      >
        <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="p-6 space-y-6">
          {/* Overview Stats */}
          <OverviewStats />

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueChart />
            <OccupancyChart />
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Properties Table */}
          <PropertyTable />

          {/* Bottom Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            <MaintenanceRequests />
            <TenantOverview />
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
}
