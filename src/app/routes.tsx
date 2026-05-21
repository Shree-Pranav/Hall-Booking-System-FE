import { Navigate, Route, Routes } from "react-router-dom";

import { AuthDashboardPage } from "../features/auth/pages/AuthDashboardPage";
import AdminDashboardPage from "../features/halls/pages/AdminDashboardPage";
import FacilitiesPage from "../features/halls/pages/FacilitiesPage";
import BookingsPage from "../features/bookings/pages/BookingsPage";
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
      <Route path="/admin/facilities" element={<FacilitiesPage />} />
      <Route path="/admin/bookings" element={<BookingsPage />} />
      <Route path="/user" element={<UserDashboardPage />} />
      <Route path="/user/bookings" element={<BookingsPage />} />
      <Route
        path="/register"
        element={
          user ? (
            user.role === "admin" ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/user" replace />
            )
          ) : (
            <AuthDashboardPage initialMode="register" />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
