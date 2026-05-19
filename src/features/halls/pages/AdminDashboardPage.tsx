import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { HallList } from "../components/HallList";
import type { Hall } from "../services/hallsService";
import {
  listHalls,
  createHall,
  updateHall,
  deleteHall,
} from "../services/hallsService";

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [floor, setFloor] = useState(0);
  const [editing, setEditing] = useState<Hall | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const data = await listHalls();
    setHalls(data);
  }

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "admin") return <Navigate to="/user" replace />;

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || capacity <= 0 || floor < 0) return;
    const created = await createHall({ name, capacity, floor });
    setHalls((s) => [created, ...s]);
    setName("");
    setCapacity(0);
    setFloor(0);
  }

  async function handleDelete(id: string) {
    await deleteHall(id);
    setHalls((s) => s.filter((h) => h.id !== id));
  }

  async function handleEdit(hall: Hall) {
    setEditing(hall);
    setName(hall.name);
    setCapacity(hall.capacity);
    setFloor(hall.floor);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !name || capacity <= 0 || floor < 0) return;
    const updated = await updateHall(editing.id, { name, capacity, floor });
    setHalls((s) => s.map((h) => (h.id === updated.id ? updated : h)));
    setEditing(null);
    setName("");
    setCapacity(0);
    setFloor(0);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2 style={{ color: "#333", marginBottom: 20 }}>Admin Dashboard</h2>
      <div
        style={{
          padding: 12,
          marginBottom: 20,
          borderRadius: 4,
          backgroundColor: "#e7f3ff",
          borderLeft: "4px solid #2196F3",
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

      <section
        style={{
          padding: 16,
          marginBottom: 24,
          borderRadius: 4,
          border: "1px solid #ddd",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          {editing ? "Edit hall" : "Create hall"}
        </h3>
        <form onSubmit={editing ? handleUpdate : handleCreate}>
          <div style={{ marginBottom: 12 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
            >
              Hall Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: 4,
                fontSize: "1em",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
            >
              Capacity
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              min="1"
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: 4,
                fontSize: "1em",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
            >
              Floor
            </label>
            <input
              type="number"
              value={floor}
              onChange={(e) => setFloor(Number(e.target.value))}
              min="0"
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: 4,
                fontSize: "1em",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginTop: 16 }}>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: "1em",
                fontWeight: 500,
              }}
            >
              {editing ? "Update" : "Create"}
            </button>
            {editing ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setName("");
                  setCapacity(0);
                  setFloor(0);
                }}
                style={{
                  marginLeft: 8,
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: "1em",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section>
        <h3 style={{ marginTop: 0 }}>Halls</h3>
        <HallList
          halls={halls}
          showActions
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </section>
    </div>
  );
}
