import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AppSidebar from "@/components/sidebars/AppSidebar";
import AppHeader from "@/components/sidebars/AppHeader";
import { adminNavConfig } from "@/components/sidebars/navConfigs";
import { useSidebarResponsive } from "@/hooks/useSidebarResponsive";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, toggle: toggleSidebar } =
    useSidebarResponsive(true);

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      <AppSidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        brandName={adminNavConfig.brandName}
        brandLabel={adminNavConfig.brandLabel}
        logoIcon={adminNavConfig.logoIcon}
        logoGradient={adminNavConfig.logoGradient}
        logoShadow={adminNavConfig.logoShadow}
        accent={adminNavConfig.sidebarAccent}
        sections={adminNavConfig.sections}
      />
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-[220px]" : "md:ml-[68px] ml-0"
        }`}
      >
        <AppHeader
          accent={adminNavConfig.headerAccent}
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={toggleSidebar}
          searchPlaceholder={adminNavConfig.searchPlaceholder}
        />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
