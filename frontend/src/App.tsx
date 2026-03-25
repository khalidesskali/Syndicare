import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PageLoader } from "./components/ui/PageLoader";
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const PropertyDashboard = lazy(() => import("./pages/PropertyDashboard"));
import HomeRedirect from "./components/HomeRedirect";
import { generateRoutes } from "./components/RouteGenerator";
import {
  adminRoutes,
  syndicRoutes,
  residentRoutes,
} from "./routes/routeConfig";
import type { UserRole } from "./types/auth";

function App() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Public login and signup routes */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<PageLoader />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/signup"
        element={
          <Suspense fallback={<PageLoader />}>
            <Signup />
          </Suspense>
        }
      />
      <Route
        path="/property-dashboard"
        element={
          <Suspense fallback={<PageLoader />}>
            <PropertyDashboard />
          </Suspense>
        }
      />

      {/* Admin routes */}
      {generateRoutes({
        routes: adminRoutes,
        allowedRoles: ["ADMIN"] as UserRole[],
      })}

      {/* Syndic routes */}
      {generateRoutes({
        routes: syndicRoutes,
        allowedRoles: ["SYNDIC"] as UserRole[],
      })}

      {/* Resident routes */}
      {generateRoutes({
        routes: residentRoutes,
        allowedRoles: ["RESIDENT"] as UserRole[],
      })}
    </Routes>
  );
}

export default App;
