import React from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight, Bell, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface SidebarNavItem {
  name: string;
  icon: LucideIcon;
  path: string;
  badge?: string | number;
  badgeVariant?: "default" | "destructive";
}

export interface SidebarSection {
  title: string;
  items: SidebarNavItem[];
}

export interface SidebarAccent {
  activeBg: string;
  activeText: string;
  activeIcon: string;
  pillBg: string;
  pillGlow: string;
  /** Notification dot bg         e.g. "bg-emerald-500"                 */
  notifDot: string;
  /** Notification dot glow       e.g. "0 0 6px 2px rgba(…)"           */
  notifGlow: string;
  /** Top ambient gradient colour e.g. "rgba(209,250,229,0.6)"          */
  ambientColor: string;
  /** Badge bg when active        e.g. "bg-emerald-100"                 */
  badgeBg: string;
  /** Badge text when active      e.g. "text-emerald-700"               */
  badgeText: string;
  /** Badge border when active    e.g. "border-emerald-200"             */
  badgeBorder: string;
}

export interface AppSidebarProps {
  isOpen: boolean;
  onToggle?: () => void;
  brandName: string;
  brandLabel: string;
  logoIcon: LucideIcon;
  /** Tailwind gradient classes   e.g. "from-emerald-500 to-emerald-700" */
  logoGradient: string;
  /** Tailwind shadow class        e.g. "shadow-emerald-200/80"          */
  logoShadow: string;
  accent: SidebarAccent;
  sections: SidebarSection[];
}

// ─── Internal: single nav item ───────────────────────────────────────────────

const NavItem: React.FC<{
  item: SidebarNavItem;
  collapsed: boolean;
  accent: SidebarAccent;
}> = ({ item, collapsed, accent }) => {
  const Icon = item.icon;

  const inner = (isActive: boolean) => (
    <span
      className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl w-full",
        "transition-all duration-200 ease-out group/item",
        collapsed && "justify-center px-2",
        !isActive &&
          "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80",
        isActive && [
          accent.activeBg,
          accent.activeText,
          "shadow-[inset_0_1px_0_0_rgba(0,0,0,0.04)]",
        ]
      )}
    >
      {/* Left glow pill */}
      {isActive && (
        <span
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full",
            accent.pillBg
          )}
          style={{ boxShadow: accent.pillGlow }}
        />
      )}

      {/* Icon */}
      <span
        className={cn(
          "flex items-center justify-center w-5 h-5 shrink-0",
          "transition-transform duration-200 group-hover/item:scale-110",
          isActive
            ? accent.activeIcon
            : "text-slate-400 group-hover/item:text-slate-700"
        )}
      >
        <Icon
          className="w-[18px] h-[18px]"
          strokeWidth={isActive ? 2.25 : 1.75}
        />
      </span>

      {/* Label + optional badge */}
      {!collapsed && (
        <>
          <span
            className={cn(
              "flex-1 text-sm tracking-[-0.01em] truncate",
              isActive
                ? cn("font-semibold", accent.activeText)
                : "font-medium text-slate-500 group-hover/item:text-slate-800"
            )}
          >
            {item.name}
          </span>

          {item.badge !== undefined && (
            <Badge
              className={cn(
                "min-w-[18px] px-1.5 text-[10px] font-bold rounded-full border",
                item.badgeVariant === "destructive"
                  ? "bg-red-100 text-red-600 border-red-200"
                  : cn(accent.badgeBg, accent.badgeText, accent.badgeBorder)
              )}
            >
              {item.badge}
            </Badge>
          )}

          {isActive && (
            <ChevronRight
              className={cn(
                "w-3.5 h-3.5 opacity-60 shrink-0",
                accent.activeText
              )}
              strokeWidth={2.5}
            />
          )}
        </>
      )}
    </span>
  );

  const link = (
    <NavLink to={item.path} className="block w-full">
      {({ isActive }) => inner(isActive)}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <li>{link}</li>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-slate-900 text-slate-100 border-slate-700 text-xs font-medium ml-1"
        >
          {item.name}
        </TooltipContent>
      </Tooltip>
    );
  }

  return <li>{link}</li>;
};

const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onToggle,
  brandName,
  brandLabel,
  logoIcon: LogoIcon,
  logoGradient,
  logoShadow,
  accent,
  sections,
}) => {
  const collapsed = !isOpen;

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-40 flex flex-col",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-[220px]",
          "bg-white border-r border-slate-100",
          "shadow-[1px_0_12px_0_rgba(0,0,0,0.04)]"
        )}
      >
        {/* Noise texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.018]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px",
          }}
        />

        {/* Role ambient gradient glow at top */}
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-40 z-0"
          style={{
            background: `linear-gradient(to bottom, ${accent.ambientColor}, transparent)`,
          }}
        />

        {/* ── Logo header ── */}
        <div
          className={cn(
            "relative z-10 flex items-center h-16 px-4 shrink-0",
            "border-b border-slate-100",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div
                className={cn(
                  "w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
                  logoGradient,
                  logoShadow
                )}
              >
                <LogoIcon
                  className="w-[18px] h-[18px] text-white"
                  strokeWidth={2.5}
                />
              </div>
              <div
                className={cn(
                  "absolute inset-0 rounded-xl blur-md -z-10 scale-125 opacity-20 bg-gradient-to-br",
                  logoGradient
                )}
              />
            </div>

            {!collapsed && (
              <div className="min-w-0 overflow-hidden">
                <p className="text-sm font-bold text-slate-900 tracking-tight leading-none truncate">
                  {brandName}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {brandLabel}
                </p>
              </div>
            )}
          </div>

          {!collapsed && onToggle && (
            <button
              onClick={onToggle}
              className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-150"
            >
              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-5 scrollbar-none">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 select-none">
                  {section.title}
                </p>
              )}
              {collapsed && sIdx > 0 && (
                <Separator className="bg-slate-100 mb-2" />
              )}
              <ul className="space-y-0.5">
                {section.items.map((item, iIdx) => (
                  <NavItem
                    key={iIdx}
                    item={item}
                    collapsed={collapsed}
                    accent={accent}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className="relative z-10 border-t border-slate-100 p-3 space-y-1 shrink-0">
          {!collapsed ? (
            <button
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80",
                "transition-all duration-150 group/notif"
              )}
            >
              <Bell
                className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  `group-hover/notif:${accent.activeIcon}`
                )}
                strokeWidth={1.75}
              />
              <span className="text-sm font-medium flex-1 text-left">
                Notifications
              </span>
              <span
                className={cn("w-2 h-2 rounded-full", accent.notifDot)}
                style={{ boxShadow: accent.notifGlow }}
              />
            </button>
          ) : (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button className="relative w-full flex justify-center items-center py-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-150">
                  <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
                  <span
                    className={cn(
                      "absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full",
                      accent.notifDot
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-slate-900 text-slate-100 border-slate-700 text-xs ml-1"
              >
                Notifications
              </TooltipContent>
            </Tooltip>
          )}

          {collapsed && onToggle && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggle}
                  className="w-full flex justify-center items-center py-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-150"
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-slate-900 text-slate-100 border-slate-700 text-xs ml-1"
              >
                Expand sidebar
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default AppSidebar;
