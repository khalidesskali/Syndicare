import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AppSidebar from "@/components/sidebars/AppSidebar";
import AppHeader from "@/components/sidebars/AppHeader";
import { syndicNavConfig } from "@/components/sidebars/navConfigs";

interface SyndicLayoutProps {
  children?: React.ReactNode;
}

const SyndicLayout: React.FC<SyndicLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      <AppSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((p) => !p)}
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
          sidebarOpen ? "ml-[220px]" : "ml-[68px]"
        }`}
      >
        <AppHeader
          accent={syndicNavConfig.headerAccent}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((p) => !p)}
          user={user}
          onLogout={handleLogout}
          searchPlaceholder={syndicNavConfig.searchPlaceholder}
        />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default SyndicLayout;
