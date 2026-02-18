import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AppSidebar from "@/components/sidebars/AppSidebar";
import AppHeader from "@/components/sidebars/AppHeader";
import { adminNavConfig } from "@/components/sidebars/navConfigs";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      <AppSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((p) => !p)}
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
          sidebarOpen ? "ml-[220px]" : "ml-[68px]"
        }`}
      >
        <AppHeader
          accent={adminNavConfig.headerAccent}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((p) => !p)}
          user={user}
          onLogout={handleLogout}
          searchPlaceholder={adminNavConfig.searchPlaceholder}
        />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
