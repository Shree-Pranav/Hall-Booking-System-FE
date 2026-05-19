import { Navigate, Route, Routes } from "react-router-dom";

import { AuthDashboardPage } from "../features/auth/pages/AuthDashboardPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
