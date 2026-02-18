import {
  LayoutDashboard,
  Settings,
  CreditCard,
  DollarSign,
  Calendar,
  MessageSquare,
  Users,
  Building2,
  Home,
  Sparkles,
  TrendingUp,
  Shield,
  Receipt,
  Bell,
  User,
} from "lucide-react";

import type { SidebarSection, SidebarAccent } from "./AppSidebar";
import type { HeaderAccent } from "./AppHeader";

// ─── Shared shape ─────────────────────────────────────────────────────────────

export interface RoleNavConfig {
  // Sidebar
  brandName: string;
  brandLabel: string;
  logoIcon: any;
  logoGradient: string;
  logoShadow: string;
  sidebarAccent: SidebarAccent;
  sections: SidebarSection[];
  // Header
  headerAccent: HeaderAccent;
  searchPlaceholder: string;
}

export const syndicNavConfig: RoleNavConfig = {
  brandName: "Syndicare",
  brandLabel: "Syndic Panel",
  logoIcon: TrendingUp,
  logoGradient: "from-emerald-500 to-emerald-700",
  logoShadow: "shadow-emerald-200/80",

  sidebarAccent: {
    activeBg: "bg-emerald-50",
    activeText: "text-emerald-700",
    activeIcon: "text-emerald-600",
    pillBg: "bg-emerald-500",
    pillGlow: "0 0 8px 2px rgba(16,185,129,0.35)",
    notifDot: "bg-emerald-500",
    notifGlow: "0 0 6px 2px rgba(16,185,129,0.4)",
    ambientColor: "rgba(209,250,229,0.6)",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
  },

  headerAccent: {
    searchIcon: "text-emerald-500",
    searchBorder: "border-emerald-400",
    searchRing: "ring-emerald-100",
    avatarFrom: "from-emerald-500",
    avatarTo: "to-emerald-700",
    avatarShadow: "shadow-emerald-200",
    onlineDot: "bg-emerald-500",
    notifDot: "bg-red-500",
    notifGlow: "0 0 4px 1px rgba(239,68,68,0.5)",
  },

  searchPlaceholder: "Search buildings, residents...",

  // Exact sections from SyndicSidebar.tsx
  sections: [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/syndic/dashboard" },
      ],
    },
    {
      title: "Property",
      items: [
        { name: "Residents", icon: Users, path: "/syndic/residents" },
        { name: "Buildings", icon: Building2, path: "/syndic/buildings" },
        { name: "Apartments", icon: Home, path: "/syndic/apartments" },
      ],
    },
    {
      title: "Financial",
      items: [
        { name: "Monthly Fees", icon: DollarSign, path: "/syndic/charges" },
        { name: "Payments", icon: CreditCard, path: "/syndic/payments" },
        {
          name: "Subscription",
          icon: Sparkles,
          path: "/syndic/subscription-management",
        },
      ],
    },
    {
      title: "Community",
      items: [
        { name: "Reunions", icon: Calendar, path: "/syndic/reunions" },
        { name: "Complaints", icon: MessageSquare, path: "/syndic/complaints" },
      ],
    },
    {
      title: "System",
      items: [{ name: "Settings", icon: Settings, path: "/syndic/settings" }],
    },
  ],
};

export const adminNavConfig: RoleNavConfig = {
  brandName: "Syndicare",
  brandLabel: "Admin Panel",
  logoIcon: Shield,
  logoGradient: "from-blue-500 to-blue-700",
  logoShadow: "shadow-blue-200/80",

  sidebarAccent: {
    activeBg: "bg-blue-50",
    activeText: "text-blue-700",
    activeIcon: "text-blue-600",
    pillBg: "bg-blue-500",
    pillGlow: "0 0 8px 2px rgba(59,130,246,0.35)",
    notifDot: "bg-blue-500",
    notifGlow: "0 0 6px 2px rgba(59,130,246,0.4)",
    ambientColor: "rgba(219,234,254,0.6)",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200",
  },

  headerAccent: {
    searchIcon: "text-blue-500",
    searchBorder: "border-blue-400",
    searchRing: "ring-blue-100",
    avatarFrom: "from-blue-600", // matches "from-blue-600" in AdminLayout
    avatarTo: "to-blue-700",
    avatarShadow: "shadow-blue-200",
    onlineDot: "bg-blue-500",
    notifDot: "bg-red-500",
    notifGlow: "0 0 4px 1px rgba(239,68,68,0.5)",
  },

  searchPlaceholder: "Search syndics, subscriptions...",

  // Exact sections from Sidebar.tsx (admin)
  sections: [
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
        {
          name: "Subscription Assignment",
          icon: Shield,
          path: "/admin/subscription-assignment",
        },
        { name: "Payments", icon: DollarSign, path: "/admin/payments" },
      ],
    },
  ],
};

export const residentNavConfig: RoleNavConfig = {
  brandName: "Syndicare",
  brandLabel: "Resident Portal",
  logoIcon: Home,
  logoGradient: "from-blue-600 to-blue-700",
  logoShadow: "shadow-blue-200/80",

  sidebarAccent: {
    activeBg: "bg-blue-50",
    activeText: "text-blue-700",
    activeIcon: "text-blue-600",
    pillBg: "bg-blue-500",
    pillGlow: "0 0 8px 2px rgba(59,130,246,0.35)",
    notifDot: "bg-blue-500",
    notifGlow: "0 0 6px 2px rgba(59,130,246,0.4)",
    ambientColor: "rgba(219,234,254,0.6)",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200",
  },

  headerAccent: {
    searchIcon: "text-blue-500",
    searchBorder: "border-blue-400",
    searchRing: "ring-blue-100",
    avatarFrom: "from-blue-600", // matches "from-blue-600" in ResidentLayout
    avatarTo: "to-blue-700",
    avatarShadow: "shadow-blue-200",
    onlineDot: "bg-blue-500",
    notifDot: "bg-red-500",
    notifGlow: "0 0 4px 1px rgba(239,68,68,0.5)",
  },

  searchPlaceholder: "Search charges, payments...",

  // Exact sections from ResidentSidebar.tsx
  sections: [
    {
      title: "Overview",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
          path: "/resident/dashboard",
        },
      ],
    },
    {
      title: "Financial",
      items: [
        { name: "My Charges", icon: CreditCard, path: "/resident/charges" },
        { name: "My Payments", icon: Receipt, path: "/resident/payments" },
      ],
    },
    {
      title: "Community",
      items: [
        {
          name: "Reclamations",
          icon: MessageSquare,
          path: "/resident/reclamations",
        },
        { name: "Announcements", icon: Bell, path: "/resident/announcements" },
      ],
    },
    {
      title: "Account",
      items: [{ name: "Profile", icon: User, path: "/resident/profile" }],
    },
  ],
};
