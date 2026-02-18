import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  user?: {
    first_name?: string;
    last_name?: string;
    role?: string;
  };
  onLogout?: () => void;
}

const SyndicHeader: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  user,
  onLogout,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials =
    `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase();
  const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
  const role = user?.role ?? "";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16",
        "bg-white/90 backdrop-blur-md",
        "border-b border-slate-100",
        // Matches sidebar's shadow treatment
        "shadow-[0_1px_8px_0_rgba(0,0,0,0.04)]",
        "flex items-center",
      )}
    >
      <div className="flex items-center justify-between w-full px-4 sm:px-6 gap-4">
        {/* ── Left: sidebar toggle + search ── */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Sidebar toggle — matches sidebar's button style */}
          <button
            onClick={onToggleSidebar}
            className={cn(
              "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center",
              "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
              "transition-all duration-150",
            )}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose
                className="w-[18px] h-[18px]"
                strokeWidth={1.75}
              />
            ) : (
              <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={1.75} />
            )}
          </button>

          {/* Search bar — hidden on mobile, shown md+ */}
          <div className="hidden md:block relative">
            <Search
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-150",
                searchFocused ? "text-emerald-500" : "text-slate-400",
              )}
              strokeWidth={1.75}
            />
            <input
              type="text"
              placeholder="Search buildings, residents..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                "w-56 lg:w-72 pl-9 pr-4 py-2 text-sm",
                "bg-slate-50 border rounded-xl",
                "text-slate-700 placeholder:text-slate-400",
                "outline-none transition-all duration-200",
                searchFocused
                  ? "border-emerald-400 ring-3 ring-emerald-100 bg-white w-72 lg:w-80"
                  : "border-slate-200 hover:border-slate-300",
              )}
            />
            {/* Keyboard shortcut hint */}
            {!searchFocused && (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-md pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Mobile search icon */}
          <button
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-150"
            aria-label="Search"
          >
            <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </button>
        </div>

        {/* ── Right: notifications + profile ── */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Notification bell */}
          <button
            className={cn(
              "relative w-9 h-9 rounded-xl flex items-center justify-center",
              "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
              "transition-all duration-150",
            )}
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
            {/* Live dot — matches sidebar notification dot */}
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_1px_rgba(239,68,68,0.5)]" />
          </button>

          {/* Divider */}
          <Separator orientation="vertical" className="h-6 mx-2 bg-slate-100" />

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1.5 rounded-xl",
                "hover:bg-slate-100 transition-all duration-150",
                profileOpen && "bg-slate-100",
              )}
              aria-expanded={profileOpen}
            >
              {/* Name + role — hidden on mobile */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {fullName}
                </p>
                <p className="text-[11px] text-slate-400 uppercase tracking-wide leading-tight mt-0.5">
                  {role}
                </p>
              </div>

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm shadow-emerald-200">
                  <span className="text-xs font-bold text-white tracking-wide">
                    {initials}
                  </span>
                </div>
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
              </div>

              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                  profileOpen && "rotate-180",
                )}
                strokeWidth={2.5}
              />
            </button>

            {/* Dropdown menu */}
            {profileOpen && (
              <div
                className={cn(
                  "absolute right-0 top-full mt-2 w-52",
                  "bg-white rounded-xl border border-slate-100",
                  "shadow-lg shadow-slate-200/60",
                  "py-1.5 z-50",
                  "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150",
                )}
              >
                {/* User info header */}
                <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {fullName}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide">
                    {role}
                  </p>
                </div>

                {/* Logout */}
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout?.();
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 mx-1 rounded-lg",
                    "text-sm text-red-600 font-medium",
                    "hover:bg-red-50 transition-colors duration-150",
                    "w-[calc(100%-8px)]",
                  )}
                >
                  <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SyndicHeader;
