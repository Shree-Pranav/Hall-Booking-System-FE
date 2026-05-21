import { FormEvent, useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  LogOut,
  Plus,
  Save,
  Settings,
  X,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useAuth } from "../../../context/AuthContext";
import { AppShell } from "../../../layouts/AppShell";
import { getApiErrorMessage } from "../../../services/apiError";
import { HallList } from "../components/HallList";
import type { Hall } from "../services/hallsService";
import {
  listHalls,
  createHall,
  updateHall,
  listFacilities,
  addFacilityToHall,
  removeFacilityFromHall,
} from "../services/hallsService";

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [floor, setFloor] = useState(0);
  const [editing, setEditing] = useState<Hall | null>(null);
  const [facilities, setFacilities] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [selectedFacilities, setSelectedFacilities] = useState<Set<number>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const [hallData, facilityData] = await Promise.all([
        listHalls(),
        listFacilities(),
      ]);
      setHalls(hallData);
      setFacilities(facilityData);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "admin") return <Navigate to="/user" replace />;

  async function handleLogout() {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name || capacity <= 0 || floor < 0) return;
    setError(null);
    try {
      const created = await createHall({ name, capacity, floor });
      for (const facilityId of Array.from(selectedFacilities)) {
        const facility = facilities.find((item) => item.id === facilityId);
        if (facility) {
          await addFacilityToHall(facility.name, created.name);
        }
      }
      await load();
      setName("");
      setCapacity(0);
      setFloor(0);
      setSelectedFacilities(new Set());
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleToggleHallActive(hall: Hall) {
    setError(null);
    try {
      await updateHall(hall.id, { is_active: !hall.is_active });
      await load();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleEdit(hall: Hall) {
    setEditing(hall);
    setName(hall.name);
    setCapacity(hall.capacity);
    setFloor(hall.floor);
    const active = new Set<number>();
    (hall.facilities ?? []).forEach((hf) => {
      if (hf.is_active) active.add(hf.facility.id);
    });
    setSelectedFacilities(active);
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editing || !name || capacity <= 0 || floor < 0) return;
    setError(null);
    try {
      const updated = await updateHall(editing.id, { name, capacity, floor });
      const prevActive = new Set<number>(
        (editing.facilities ?? [])
          .filter((f) => f.is_active)
          .map((f) => f.facility.id),
      );
      const nowSelected = selectedFacilities;

      for (const facilityId of Array.from(nowSelected)) {
        if (!prevActive.has(facilityId)) {
          const facility = facilities.find((item) => item.id === facilityId);
          if (facility) {
            await addFacilityToHall(facility.name, updated.name);
          }
        }
      }

      for (const facilityId of Array.from(prevActive)) {
        if (!nowSelected.has(facilityId)) {
          const facility = facilities.find((item) => item.id === facilityId);
          if (facility) {
            await removeFacilityFromHall(facility.name, updated.name);
          }
        }
      }

      await load();
      setEditing(null);
      setName("");
      setCapacity(0);
      setFloor(0);
      setSelectedFacilities(new Set());
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    }
  }

  function toggleFacility(id: number) {
    setSelectedFacilities((s) => {
      const copy = new Set(Array.from(s));
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  }

  function resetForm() {
    setEditing(null);
    setName("");
    setCapacity(0);
    setFloor(0);
    setSelectedFacilities(new Set());
  }

  return (
    <AppShell>
      <section className="page-toolbar">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h2>Hall operations</h2>
        </div>
        <div className="toolbar-actions">
          <Button
            type="button"
            variant="secondary"
            icon={<CalendarDays size={16} />}
            onClick={() => navigate("/admin/bookings")}
          >
            Bookings
          </Button>
          <Button
            type="button"
            variant="secondary"
            icon={<Settings size={16} />}
            onClick={() => navigate("/admin/facilities")}
          >
            Facilities
          </Button>
          <Button
            type="button"
            variant="danger"
            icon={<LogOut size={16} />}
            onClick={handleLogout}
            disabled={isLoading}
          >
            Logout
          </Button>
        </div>
      </section>

      {error ? (
        <div className="alert" role="alert">
          <span>{error}</span>
        </div>
      ) : null}
      {isLoading ? (
        <div className="empty-state">Loading dashboard...</div>
      ) : null}

      <section className="profile-strip profile-strip--admin">
        <div>
          <span>Signed in</span>
          <strong>{user.name}</strong>
        </div>
        <span className="status-pill">{user.role}</span>
      </section>

      <div className="dashboard-grid dashboard-grid--admin">
        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Inventory</p>
              <h2>{editing ? "Edit hall" : "Create hall"}</h2>
            </div>
            <span className="panel-icon" aria-hidden="true">
              <Building2 size={20} />
            </span>
          </div>

          <form
            className="form-stack"
            onSubmit={editing ? handleUpdate : handleCreate}
          >
            <Input
              label="Hall Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
            <div className="form-grid">
              <Input
                label="Capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min="1"
                required
                disabled={isLoading}
              />
              <Input
                label="Floor"
                type="number"
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                min="0"
                required
                disabled={isLoading}
              />
            </div>

            <div className="field">
              <span className="field__label">Facilities</span>
              <div className="chip-grid">
                {facilities.map((facility) => (
                  <label className="choice-chip" key={facility.id}>
                    <input
                      type="checkbox"
                      checked={selectedFacilities.has(facility.id)}
                      onChange={() => toggleFacility(facility.id)}
                      disabled={isLoading}
                    />
                    <span>{facility.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="button-row">
              <Button
                type="submit"
                icon={editing ? <Save size={16} /> : <Plus size={16} />}
                disabled={isLoading}
              >
                {editing ? "Update" : "Create"}
              </Button>
              {editing ? (
                <Button
                  type="button"
                  variant="secondary"
                  icon={<X size={16} />}
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="panel panel--wide">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Directory</p>
              <h2>Halls</h2>
            </div>
          </div>
          {!isLoading ? (
            <HallList
              halls={halls}
              showActions
              onToggleActive={handleToggleHallActive}
              onEdit={handleEdit}
            />
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
