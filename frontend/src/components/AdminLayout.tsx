import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Bell, Search, Menu, X, LogOut, ChevronDown } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {sidebarOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>

                {/* Search Bar */}
                <div className="hidden md:flex">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-3 pl-4 border-l border-slate-200 hover:bg-slate-100 rounded-lg pr-2 py-1 transition-colors"
                  >
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-slate-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-slate-500">{user?.role}</p>
                    </div>
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.first_name?.[0]}
                      {user?.last_name?.[0]}
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
