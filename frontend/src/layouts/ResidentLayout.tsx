import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import AppSidebar from "../components/sidebars/AppSidebar";
import AppHeader from "@/components/sidebars/AppHeader";
import { residentNavConfig } from "@/components/sidebars/navConfigs";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import { useSidebarResponsive } from "@/hooks/useSidebarResponsive";

interface ResidentLayoutProps {
  children?: React.ReactNode;
}

const ResidentLayout: React.FC<ResidentLayoutProps> = ({ children }) => {
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
        brandName={residentNavConfig.brandName}
        brandLabel={residentNavConfig.brandLabel}
        logoIcon={residentNavConfig.logoIcon}
        logoGradient={residentNavConfig.logoGradient}
        logoShadow={residentNavConfig.logoShadow}
        accent={residentNavConfig.sidebarAccent}
        sections={residentNavConfig.sections}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-[220px]" : "md:ml-[68px] ml-0"
        }`}
      >
        <AppHeader
          accent={residentNavConfig.headerAccent}
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={toggleSidebar}
          searchPlaceholder={residentNavConfig.searchPlaceholder}
        />

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
};

export default ResidentLayout;
