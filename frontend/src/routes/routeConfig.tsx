import { type ReactElement } from "react";
import AdminDashboard from "../pages/AdminDashboard";
import Syndics from "../pages/admin/Synidc";
import SubscriptionPlans from "../pages/admin/SubscriptionPlans";
import Payments from "../pages/admin/Payments";
import SubscriptionAssignment from "../pages/admin/SubscriptionAssignment";
import SyndicDashboard from "../pages/SyndicDashboard";
import Buildings from "../pages/syndic/Buildings";
import ChargeModule from "../pages/syndic/Charge";
import ReunionPage from "../pages/syndic/Reunion";
import ApartmentPage from "../pages/syndic/Apartment";
import ComplaintPage from "../pages/syndic/Complaint";
import Residents from "../pages/syndic/Residents";
import SyndicPayments from "../pages/syndic/Payments";
import PaymentManagement from "../pages/syndic/PaymentManagement";
import ResidentLayout from "../layouts/ResidentLayout";
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
    element: <AdminDashboard />,
  },
  {
    path: "/admin/syndics",
    element: <Syndics />,
  },
  {
    path: "/admin/subscriptions",
    element: <SubscriptionPlans />,
  },
  {
    path: "/admin/payments",
    element: <Payments />,
  },
  {
    path: "/admin/subscription-assignment",
    element: <SubscriptionAssignment />,
  },
];

export const syndicRoutes: RouteConfig[] = [
  {
    path: "/syndic/dashboard",
    element: <SyndicDashboard />,
  },
  {
    path: "/syndic/buildings",
    element: <Buildings />,
  },
  {
    path: "/syndic/residents",
    element: <Residents />,
  },
  {
    path: "/syndic/charges",
    element: <ChargeModule />,
  },
  {
    path: "/syndic/reunions",
    element: <ReunionPage />,
  },
  {
    path: "/syndic/apartments",
    element: <ApartmentPage />,
  },
  {
    path: "/syndic/complaints",
    element: <ComplaintPage />,
  },
  {
    path: "/syndic/payments",
    element: <SyndicPayments />,
  },
  {
    path: "/syndic/payment-management",
    element: <PaymentManagement />,
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
