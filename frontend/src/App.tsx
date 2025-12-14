import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import SyndicDashboard from "./pages/SyndicDashboard";
import ResidentDashboard from "./pages/ResidentDashboard";
import RoleRedirect from "./components/RoleRedirect";
import { useAuth } from "./context/AuthContext";
import Syndics from "./pages/admin/Synidc";
import SubscriptionPlans from "./pages/admin/SubscriptionPlans";
import Payments from "./pages/admin/Payments";
import Buildings from "./pages/syndic/Buildings";
import Residents from "./components/Residents";
import Charge from "./pages/syndic/Charge";
import Reunion from "./pages/syndic/Reunion";

function App() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      {/* Public login route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      {/* Dashboard routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/syndics"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["ADMIN"]}>
              <Syndics />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subscriptions"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["ADMIN"]}>
              <SubscriptionPlans />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["ADMIN"]}>
              <Payments />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/syndic/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["SYNDIC"]}>
              <SyndicDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/syndic/buildings"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["SYNDIC"]}>
              <Buildings />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/syndic/residents"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["SYNDIC"]}>
              <Residents />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/syndic/charges"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["SYNDIC"]}>
              <Charge />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/syndic/reunions"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["SYNDIC"]}>
              <Reunion />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/resident/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["RESIDENT"]}>
              <ResidentDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<RoleRedirect />} />
    </Routes>
  );
}

export default App;
