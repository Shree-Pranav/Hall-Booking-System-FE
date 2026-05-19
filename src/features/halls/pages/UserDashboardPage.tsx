import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { HallList } from "../components/HallList";
import type { Hall } from "../services/hallsService";
import { listHalls } from "../services/hallsService";

export default function UserDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [halls, setHalls] = useState<Hall[]>([]);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const data = await listHalls();
    setHalls(data);
  }

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "user") return <Navigate to="/admin" replace />;

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2 style={{ color: "#333", marginBottom: 20 }}>User Dashboard</h2>
      <div
        style={{
          padding: 12,
          marginBottom: 20,
          borderRadius: 4,
          backgroundColor: "#e8f5e9",
          borderLeft: "4px solid #4CAF50",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>{user.name}</strong> — {user.role}
        </p>
        <button
          onClick={handleLogout}
          style={{
            padding: "6px 12px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "0.9em",
            fontWeight: 500,
          }}
        >
          Logout
        </button>
      </div>

      <section>
        <h3 style={{ marginTop: 0 }}>Available Halls</h3>
        <HallList halls={halls} />
      </section>
    </div>
  );
}
