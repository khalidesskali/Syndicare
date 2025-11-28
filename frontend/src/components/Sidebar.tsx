import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  Settings,
  Building2,
  BarChart3,
  FileText,
  Bell,
  Shield,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const menuItems = [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
      ],
    },
    {
      title: "Management",
      items: [
        { name: "Syndics", icon: Users, path: "/admin/syndics" },
        {
          name: "Subscriptions",
          icon: CreditCard,
          path: "/admin/subscriptions",
        },
        { name: "Payments", icon: DollarSign, path: "/admin/payments" },
      ],
    },
    {
      title: "System",
      items: [
        { name: "Notifications", icon: Bell, path: "/admin/notifications" },
        { name: "Settings", icon: Settings, path: "/admin/settings" },
      ],
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-40 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {isOpen && (
              <div>
                <h1 className="text-lg font-bold text-slate-900">Syndicare</h1>
                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-8 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {isOpen && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group ${
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-700 hover:bg-slate-100"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={`h-5 w-5 flex-shrink-0 ${
                              isActive
                                ? "text-blue-600"
                                : "text-slate-500 group-hover:text-slate-700"
                            }`}
                          />
                          {isOpen && (
                            <>
                              <span className="flex-1 font-medium">
                                {item.name}
                              </span>
                              {isActive && (
                                <ChevronRight className="h-4 w-4 text-blue-600" />
                              )}
                            </>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
