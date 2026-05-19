import { Navigate, Route, Routes } from "react-router-dom";

import { AuthDashboardPage } from "../features/auth/pages/AuthDashboardPage";
import AdminDashboardPage from "../features/halls/pages/AdminDashboardPage";
import UserDashboardPage from "../features/halls/pages/UserDashboardPage";
import { useAuth } from "../context/AuthContext";

export function AppRoutes() {
  const { user, isHydrating } = useAuth();

  // while hydrating, show nothing
  if (isHydrating) return <></>;

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            user.role === "admin" ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/user" replace />
            )
          ) : (
            <AuthDashboardPage />
          )
        }
      />

      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/user" element={<UserDashboardPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
