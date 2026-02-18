import React, { useState, useRef, useEffect } from "react";
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

export interface HeaderAccent {
  searchIcon: string;
  searchBorder: string;
  searchRing: string;
  avatarFrom: string;
  avatarTo: string;
  avatarShadow: string;
  onlineDot: string;
  notifDot: string;
  notifGlow: string;
}

export interface AppHeaderUser {
  first_name?: string;
  last_name?: string;
  role?: string;
}

export interface AppHeaderProps {
  accent: HeaderAccent;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  user?: AppHeaderUser | null;
  onLogout?: () => void;
  searchPlaceholder?: string;
  notificationCount?: number;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  accent,
  sidebarOpen,
  onToggleSidebar,
  user,
  onLogout,
  searchPlaceholder = "Search...",
  notificationCount = 0,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase() ||
    "??";
  const fullName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || "User";
  const roleLabel = user?.role?.toUpperCase() ?? "";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16 flex items-center",
        "bg-white/90 backdrop-blur-md",
        "border-b border-slate-100",
        "shadow-[0_1px_8px_0_rgba(0,0,0,0.04)]",
      )}
    >
      <div className="flex items-center justify-between w-full px-4 sm:px-6 gap-4">
        {/* ── Left: toggle + search ── */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-150"
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

          {/* Search — desktop */}
          <div className="hidden md:block relative">
            <Search
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-150",
                searchFocused ? accent.searchIcon : "text-slate-400",
              )}
              strokeWidth={1.75}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                "pl-9 pr-10 py-2 text-sm rounded-xl border outline-none",
                "bg-slate-50 text-slate-700 placeholder:text-slate-400",
                "transition-all duration-200",
                searchFocused
                  ? cn(
                      "bg-white w-72 lg:w-80 ring-3",
                      accent.searchBorder,
                      accent.searchRing,
                    )
                  : "w-56 lg:w-72 border-slate-200 hover:border-slate-300",
              )}
            />
            {!searchFocused && (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-md pointer-events-none select-none">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Search — mobile icon */}
          <button
            aria-label="Search"
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-150"
          >
            <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </button>
        </div>

        {/* ── Right: bell + divider + profile ── */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Bell */}
          <button
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-150"
          >
            <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
            {notificationCount > 0 ? (
              <span
                className={cn(
                  "absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1",
                  "flex items-center justify-center rounded-full",
                  "text-[9px] font-bold text-white",
                  accent.notifDot,
                )}
                style={{ boxShadow: accent.notifGlow }}
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : (
              <span
                className={cn(
                  "absolute top-2 right-2 w-1.5 h-1.5 rounded-full",
                  accent.notifDot,
                )}
                style={{ boxShadow: accent.notifGlow }}
              />
            )}
          </button>

          <Separator orientation="vertical" className="h-6 mx-2 bg-slate-100" />

          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen((p) => !p)}
              aria-expanded={profileOpen}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1.5 rounded-xl",
                "hover:bg-slate-100 transition-all duration-150",
                profileOpen && "bg-slate-100",
              )}
            >
              {/* Name + role — hidden on mobile */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {fullName}
                </p>
                <p className="text-[11px] text-slate-400 uppercase tracking-wide leading-tight mt-0.5">
                  {roleLabel}
                </p>
              </div>

              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm",
                    accent.avatarFrom,
                    accent.avatarTo,
                    accent.avatarShadow,
                  )}
                >
                  <span className="text-xs font-bold text-white tracking-wide">
                    {initials}
                  </span>
                </div>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm",
                    accent.onlineDot,
                  )}
                />
              </div>

              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                  profileOpen && "rotate-180",
                )}
                strokeWidth={2.5}
              />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div
                className={cn(
                  "absolute right-0 top-full mt-2 w-52 z-50",
                  "bg-white rounded-xl border border-slate-100",
                  "shadow-lg shadow-slate-200/60 py-1.5",
                  "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150",
                )}
              >
                {/* User info */}
                <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {fullName}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide">
                    {roleLabel}
                  </p>
                </div>

                {/* Logout */}
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout?.();
                  }}
                  className="w-[calc(100%-8px)] mx-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 font-medium hover:bg-red-50 transition-colors duration-150"
                >
                  <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
