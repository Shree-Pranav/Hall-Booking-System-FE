import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Link2, MinusCircle, Plus } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useAuth } from "../../../context/AuthContext";
import { AppShell } from "../../../layouts/AppShell";
import { getApiErrorMessage } from "../../../services/apiError";
import {
  listFacilities,
  createFacility,
  listHalls,
  addFacilityToHall,
  removeFacilityFromHall,
} from "../services/hallsService";
import type { Facility, Hall } from "../services/hallsService";

export default function FacilitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [name, setName] = useState("");
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(
    null,
  );
  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const [facilityData, hallData] = await Promise.all([
        listFacilities(),
        listHalls(),
      ]);
      setFacilities(facilityData);
      setHalls(hallData);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "admin") return <Navigate to="/user" replace />;

  const selectedFacility =
    selectedFacilityId === null
      ? null
      : (facilities.find((facility) => facility.id === selectedFacilityId) ??
        null);
  const selectedHall =
    selectedHallId === null
      ? null
      : (halls.find((hall) => hall.id === selectedHallId) ?? null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name) return;
    setError(null);
    try {
      await createFacility({ name });
      setName("");
      await load();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleAddToHall() {
    if (!selectedFacility || !selectedHall) return;
    setError(null);
    try {
      await addFacilityToHall(selectedFacility.name, selectedHall.name);
      await load();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleRemoveFromHall() {
    if (!selectedFacility || !selectedHall) return;
    setError(null);
    try {
      await removeFacilityFromHall(selectedFacility.name, selectedHall.name);
      await load();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <AppShell>
      <section className="page-toolbar">
        <div>
          <p className="eyebrow">Admin tools</p>
          <h2>Facilities</h2>
        </div>
        <Button
          type="button"
          variant="secondary"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate("/admin")}
        >
          Back to Dashboard
        </Button>
      </section>

      {error ? (
        <div className="alert" role="alert">
          <span>{error}</span>
        </div>
      ) : null}
      {isLoading ? (
        <div className="empty-state">Loading facilities...</div>
      ) : null}

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Catalog</p>
              <h2>Add facility</h2>
            </div>
          </div>
          <form className="inline-form" onSubmit={handleCreate}>
            <Input
              label="Facility name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Projector, Wi-Fi, Stage"
              disabled={isLoading}
            />
            <Button type="submit" icon={<Plus size={16} />}>
              Add
            </Button>
          </form>
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Mappings</p>
              <h2>Assign to hall</h2>
            </div>
          </div>
          <div className="form-stack">
            <label className="field">
              <span className="field__label">Facility</span>
              <select
                className="field__input"
                value={selectedFacilityId ?? ""}
                onChange={(e) =>
                  setSelectedFacilityId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                disabled={isLoading}
              >
                <option value="">Select facility</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field__label">Hall</span>
              <select
                className="field__input"
                value={selectedHallId ?? ""}
                onChange={(e) => setSelectedHallId(e.target.value || null)}
                disabled={isLoading}
              >
                <option value="">Select hall</option>
                {halls.map((hall) => (
                  <option key={hall.id} value={hall.id}>
                    {hall.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="button-row">
              <Button
                type="button"
                icon={<Link2 size={16} />}
                onClick={handleAddToHall}
                disabled={isLoading}
              >
                Add to hall
              </Button>
              <Button
                type="button"
                variant="danger"
                icon={<MinusCircle size={16} />}
                onClick={handleRemoveFromHall}
                disabled={isLoading}
              >
                Remove
              </Button>
            </div>
          </div>
        </section>

        <section className="panel panel--wide">
          <div className="panel__header">
            <div>
              <p className="eyebrow">All records</p>
              <h2>All facilities</h2>
            </div>
            <span className="status-pill">{facilities.length} total</span>
          </div>
          {facilities.length === 0 ? (
            <div className="empty-state">No facilities found.</div>
          ) : (
            <ul className="facility-list">
              {facilities.map((facility) => (
                <li key={facility.id}>{facility.name}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
