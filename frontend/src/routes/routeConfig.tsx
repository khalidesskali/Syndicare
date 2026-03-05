import { type ReactElement } from "react";
import AdminDashboard from "../pages/AdminDashboard";
import Syndics from "../pages/admin/Syndics";
import SyndicDashboard from "../pages/SyndicDashboard";
import Buildings from "../pages/syndic/Buildings";
import ChargeModule from "../pages/syndic/Charge";
import ReunionPage from "../pages/syndic/Reunion";
import ApartmentPage from "../pages/syndic/Apartment";
import ComplaintPage from "../pages/syndic/Complaint";
import Residents from "../pages/syndic/Residents";
import SyndicPayments from "../pages/syndic/Payments";
import ResidentLayout from "../layouts/ResidentLayout";
import AdminLayout from "../layouts/AdminLayout";
import SyndicLayout from "../layouts/SyndicLayout";
import ResidentDashboard from "../pages/ResidentDashboard";
import Charges from "../pages/resident/Charges";
import ResidentPayments from "../pages/resident/Payments";
import Reclamations from "../pages/resident/Reclamations";
import Announcements from "../pages/resident/Announcements";
import Profile from "../pages/resident/Profile";

export interface RouteConfig {
  path: string;
  element: ReactElement;
}

export const adminRoutes: RouteConfig[] = [
  {
    path: "/admin/dashboard",
    element: (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/syndics",
    element: (
      <AdminLayout>
        <Syndics />
      </AdminLayout>
    ),
  },
];

export const syndicRoutes: RouteConfig[] = [
  {
    path: "/syndic/dashboard",
    element: (
      <SyndicLayout>
        <SyndicDashboard />
      </SyndicLayout>
    ),
  },
  {
    path: "/syndic/buildings",
    element: (
      <SyndicLayout>
        <Buildings />
      </SyndicLayout>
    ),
  },
  {
    path: "/syndic/residents",
    element: (
      <SyndicLayout>
        <Residents />
      </SyndicLayout>
    ),
  },
  {
    path: "/syndic/charges",
    element: (
      <SyndicLayout>
        <ChargeModule />
      </SyndicLayout>
    ),
  },
  {
    path: "/syndic/reunions",
    element: (
      <SyndicLayout>
        <ReunionPage />
      </SyndicLayout>
    ),
  },
  {
    path: "/syndic/apartments",
    element: (
      <SyndicLayout>
        <ApartmentPage />
      </SyndicLayout>
    ),
  },
  {
    path: "/syndic/complaints",
    element: (
      <SyndicLayout>
        <ComplaintPage />
      </SyndicLayout>
    ),
  },
  {
    path: "/syndic/payments",
    element: (
      <SyndicLayout>
        <SyndicPayments />
      </SyndicLayout>
    ),
  },
];

export const residentRoutes: RouteConfig[] = [
  {
    path: "/resident/dashboard",
    element: (
      <ResidentLayout>
        <ResidentDashboard />
      </ResidentLayout>
    ),
  },
  {
    path: "/resident/charges",
    element: (
      <ResidentLayout>
        <Charges />
      </ResidentLayout>
    ),
  },
  {
    path: "/resident/payments",
    element: (
      <ResidentLayout>
        <ResidentPayments />
      </ResidentLayout>
    ),
  },
  {
    path: "/resident/reclamations",
    element: (
      <ResidentLayout>
        <Reclamations />
      </ResidentLayout>
    ),
  },
  {
    path: "/resident/announcements",
    element: (
      <ResidentLayout>
        <Announcements />
      </ResidentLayout>
    ),
  },
  {
    path: "/resident/profile",
    element: (
      <ResidentLayout>
        <Profile />
      </ResidentLayout>
    ),
  },
];
