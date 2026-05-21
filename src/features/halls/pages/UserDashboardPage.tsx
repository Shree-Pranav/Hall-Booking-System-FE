import { useEffect, useState } from "react";
import { CalendarDays, LogOut, RefreshCw } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";
import { AppShell } from "../../../layouts/AppShell";
import { getApiErrorMessage } from "../../../services/apiError";
import { listMyBookings } from "../../bookings/services/bookingsService";
import type { Booking } from "../../bookings/services/bookingsService";
import { HallList } from "../components/HallList";
import type { FavoriteHall, Hall } from "../services/hallsService";
import { listFavoriteHalls, listHalls } from "../services/hallsService";

export default function UserDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [favoriteHallIds, setFavoriteHallIds] = useState<Set<string>>(
    new Set(),
  );
  const [favoriteHalls, setFavoriteHalls] = useState<FavoriteHall[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (user?.role !== "user") return;

    const onHallDisabled = () => {
      void load();
    };

    window.addEventListener("hall-disabled", onHallDisabled);
    return () => {
      window.removeEventListener("hall-disabled", onHallDisabled);
    };
  }, [user?.role]);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const [hallData, bookingData] = await Promise.all([
        listHalls(),
        listMyBookings().catch(() => []),
      ]);
      setHalls(hallData);
      setBookings(bookingData);

      try {
        const favoriteData = await listFavoriteHalls();
        setFavoriteHalls(favoriteData);
        setFavoriteHallIds(
          new Set(favoriteData.map((favorite) => favorite.id)),
        );
      } catch {
        setFavoriteHalls([]);
        setFavoriteHallIds(new Set());
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "user") return <Navigate to="/admin" replace />;

  async function handleLogout() {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    }
  }

  const profileDetails = (
    <dl className="profile-popover__details">
      <div>
        <dt>Name</dt>
        <dd>{user.name}</dd>
      </div>
      <div>
        <dt>Bookings</dt>
        <dd>{bookings.length}</dd>
      </div>
      <div>
        <dt>Favourite halls</dt>
        <dd>
          {favoriteHalls.length
            ? favoriteHalls.map((hall) => hall.name).join(", ")
            : "No favourite halls yet"}
        </dd>
      </div>
    </dl>
  );

  return (
    <AppShell profileDetails={profileDetails}>
      <section className="page-toolbar">
        <div>
          <p className="eyebrow">Member dashboard</p>
          <h2>Available halls</h2>
        </div>
        <div className="toolbar-actions">
          <Button
            type="button"
            icon={<CalendarDays size={16} />}
            onClick={() => navigate("/user/bookings")}
          >
            My Bookings
          </Button>
          <Button
            type="button"
            variant="danger"
            icon={<LogOut size={16} />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </section>

      <section className="profile-strip profile-strip--member">
        <div>
          <span>Signed in</span>
          <strong>{user.name}</strong>
        </div>
        <span className="status-pill status-pill--ok">{user.role}</span>
      </section>

      <section className="panel panel--wide">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Browse spaces</p>
            <h2>Available Halls</h2>
          </div>
          <Button
            type="button"
            variant="secondary"
            icon={<RefreshCw size={16} />}
            onClick={load}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
        {error ? (
          <div className="alert" role="alert">
            <span>{error}</span>
          </div>
        ) : null}
        {isLoading ? <div className="empty-state">Loading halls...</div> : null}
        {!isLoading ? (
          <HallList halls={halls} favoriteHallIds={favoriteHallIds} />
        ) : null}
      </section>
    </AppShell>
  );
}
