import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
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
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

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
