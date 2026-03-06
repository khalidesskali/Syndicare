import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AppSidebar from "@/components/sidebars/AppSidebar";
import AppHeader from "@/components/sidebars/AppHeader";
import { syndicNavConfig } from "@/components/sidebars/navConfigs";
import { useSidebarResponsive } from "@/hooks/useSidebarResponsive";

interface SyndicLayoutProps {
  children?: React.ReactNode;
}

const SyndicLayout: React.FC<SyndicLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, toggle: toggleSidebar } =
    useSidebarResponsive(true);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      <AppSidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        brandName={syndicNavConfig.brandName}
        brandLabel={syndicNavConfig.brandLabel}
        logoIcon={syndicNavConfig.logoIcon}
        logoGradient={syndicNavConfig.logoGradient}
        logoShadow={syndicNavConfig.logoShadow}
        accent={syndicNavConfig.sidebarAccent}
        sections={syndicNavConfig.sections}
      />
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-[220px]" : "md:ml-[68px] ml-0"
        }`}
      >
        <AppHeader
          accent={syndicNavConfig.headerAccent}
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={toggleSidebar}
          searchPlaceholder={syndicNavConfig.searchPlaceholder}
        />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default SyndicLayout;
