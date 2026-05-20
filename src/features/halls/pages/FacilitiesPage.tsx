import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  listFacilities,
  createFacility,
  listHalls,
  addFacilityToHall,
  modifyHallFacility,
} from "../services/hallsService";
import type { Facility, Hall } from "../services/hallsService";

export default function FacilitiesPage() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [name, setName] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [selectedHall, setSelectedHall] = useState<string>("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const f = await listFacilities();
    setFacilities(f);
    const hs = await listHalls();
    setHalls(hs);
  }

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "admin") return <Navigate to="/user" replace />;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    await createFacility({ name });
    setName("");
    await load();
  }

  async function handleAddToHall() {
    if (!selectedFacility || !selectedHall) return;
    await addFacilityToHall(selectedFacility, selectedHall);
    await load();
  }

  async function handleRemoveFromHall() {
    if (!selectedFacility || !selectedHall) return;
    await modifyHallFacility(selectedFacility, selectedHall, false);
    await load();
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2 style={{ color: "#333", marginBottom: 20 }}>Facilities</h2>

      <section
        style={{
          padding: 16,
          marginBottom: 24,
          borderRadius: 4,
          border: "1px solid #ddd",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Add facility</h3>
        <form
          onSubmit={handleCreate}
          style={{ display: "flex", gap: 12, alignItems: "center" }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Facility name"
            style={{
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: 4,
              fontSize: "1em",
              flex: 1,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 14px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </form>
      </section>

      <section
        style={{
          padding: 16,
          marginBottom: 24,
          borderRadius: 4,
          border: "1px solid #ddd",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Manage facility mappings</h3>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          >
            <option value="">Select facility</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>

          <select
            value={selectedHall}
            onChange={(e) => setSelectedHall(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          >
            <option value="">Select hall</option>
            {halls.map((h) => (
              <option key={h.id} value={h.name}>
                {h.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddToHall}
            style={{
              padding: "8px 12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
            }}
          >
            Add to hall
          </button>
          <button
            onClick={handleRemoveFromHall}
            style={{
              padding: "8px 12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 4,
            }}
          >
            Remove from hall
          </button>
        </div>
      </section>

      <section
        style={{
          padding: 16,
          borderRadius: 4,
          border: "1px solid #ddd",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>All facilities</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {facilities.map((f) => (
            <li
              key={f.id}
              style={{
                padding: 10,
                borderRadius: 4,
                border: "1px solid #eee",
                marginBottom: 8,
                background: "#fafafa",
              }}
            >
              {f.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
