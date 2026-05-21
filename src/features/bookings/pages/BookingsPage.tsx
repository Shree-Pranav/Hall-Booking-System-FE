import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PointerEvent,
} from "react";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarSearch,
  Clock3,
  LogOut,
  RotateCcw,
  Search,
  Star,
  XCircle,
} from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useAuth } from "../../../context/AuthContext";
import { AppShell } from "../../../layouts/AppShell";
import { getApiErrorMessage } from "../../../services/apiError";
import {
  listFavoriteHalls,
  listHalls,
} from "../../halls/services/hallsService";
import type { FavoriteHall, Hall } from "../../halls/services/hallsService";
import {
  bookHall,
  cancelBooking,
  listAllBookings,
  listMyBookings,
  listUserBookings,
  searchAvailableHalls,
  updateBookingTiming,
} from "../services/bookingsService";
import type { AvailableHall, Booking } from "../services/bookingsService";

const SLOT_MINUTES = 30;
const DAY_START_TIME = "00:00";

function toDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInputValue(value: Date) {
  return `${String(value.getHours()).padStart(2, "0")}:${String(
    value.getMinutes(),
  ).padStart(2, "0")}`;
}

function roundUpToHalfHour(value: Date) {
  const rounded = new Date(value);
  const minutes = rounded.getMinutes();
  const hasSeconds = rounded.getSeconds() > 0 || rounded.getMilliseconds() > 0;
  const minuteOffset = minutes % SLOT_MINUTES;

  rounded.setSeconds(0, 0);
  if (minuteOffset || hasSeconds) {
    rounded.setMinutes(minutes + (SLOT_MINUTES - minuteOffset));
  }

  return rounded;
}

function getInitialSearchState() {
  const nextBookable = roundUpToHalfHour(new Date());
  return { date: toDateInputValue(nextBookable) };
}

function parseApiDate(value: string) {
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

function toDateTimeLocalValue(value: string) {
  const date = parseApiDate(value);
  const offsetMinutes = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offsetMinutes * 60000);
  return local.toISOString().slice(0, 16);
}

function formatDateTime(value: string) {
  return parseApiDate(value).toLocaleString();
}

function formatSlotLabel(value: Date) {
  return value.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function addMinutes(value: Date, minutes: number) {
  return new Date(value.getTime() + minutes * 60000);
}

function localDateTime(dateValue: string, timeValue: string) {
  return new Date(`${dateValue}T${timeValue}`);
}

function nextDateInputValue(dateValue: string) {
  const date = localDateTime(dateValue, DAY_START_TIME);
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
}

function getSearchWindow(dateValue: string) {
  const startTime = getMinimumStartTimeForDate(dateValue);
  return {
    start: localDateTime(dateValue, startTime),
    end: localDateTime(nextDateInputValue(dateValue), DAY_START_TIME),
  };
}

function getMinimumSearchDate() {
  return toDateInputValue(new Date());
}

function getMinimumStartTimeForDate(dateValue: string) {
  return dateValue === getMinimumSearchDate()
    ? toTimeInputValue(roundUpToHalfHour(new Date()))
    : DAY_START_TIME;
}

function getMinimumDateTimeLocalValue() {
  const nextBookable = roundUpToHalfHour(new Date());
  return `${toDateInputValue(nextBookable)}T${toTimeInputValue(nextBookable)}`;
}

function dateTimeLocalToIso(value: string) {
  return new Date(value).toISOString();
}

function isHalfHourTimeValue(value: string) {
  const [, minutes = ""] = value.split(":");
  return minutes === "00" || minutes === "30";
}

function isHalfHourDateTimeValue(value: string) {
  const [, time = ""] = value.split("T");
  return isHalfHourTimeValue(time);
}

function buildTimingDrafts(rows: Booking[]) {
  return rows.reduce<Record<string, { start: string; end: string }>>(
    (acc, booking) => {
      acc[booking.id] = {
        start: toDateTimeLocalValue(booking.start_datetime),
        end: toDateTimeLocalValue(booking.end_datetime),
      };
      return acc;
    },
    {},
  );
}

function formatDuration(minutes: number) {
  if (minutes === 30) return "30 minutes";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder
    ? `${hours} hr ${remainder} min`
    : `${hours} hour${hours > 1 ? "s" : ""}`;
}

type SlotCell = {
  key: string;
  index: number;
  label: string;
  start: Date;
  end: Date;
  isAvailable: boolean;
};

type SelectedSlotRange = {
  hallId: string;
  startIndex: number;
  endIndex: number;
} | null;

export default function BookingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const initialSearchState = useMemo(() => getInitialSearchState(), []);

  const [halls, setHalls] = useState<Hall[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favoriteHalls, setFavoriteHalls] = useState<FavoriteHall[]>([]);
  const [hallSearchTerm, setHallSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState(initialSearchState.date);
  const [searchResults, setSearchResults] = useState<AvailableHall[] | null>(
    null,
  );
  const [bookingSlotKey, setBookingSlotKey] = useState<string | null>(null);
  const [selectedSlotRange, setSelectedSlotRange] =
    useState<SelectedSlotRange>(null);
  const [isSelectingSlots, setIsSelectingSlots] = useState(false);
  const [userId, setUserId] = useState("");
  const [timingDrafts, setTimingDrafts] = useState<
    Record<string, { start: string; end: string }>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const pageTitle = useMemo(
    () => (isAdminRoute ? "Bookings Admin" : "My Bookings"),
    [isAdminRoute],
  );

  const favoriteHallIds = useMemo(
    () => new Set(favoriteHalls.map((hall) => hall.id)),
    [favoriteHalls],
  );

  const sortedHallOptions = useMemo(
    () => [...halls].sort((a, b) => a.name.localeCompare(b.name)),
    [halls],
  );

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const hallData = await listHalls();
      setHalls(hallData);

      if (isAdminRoute) {
        const all = await listAllBookings();
        setBookings(all);
        setTimingDrafts(buildTimingDrafts(all));
        return;
      }

      const [mine, favoriteData] = await Promise.all([
        listMyBookings(),
        listFavoriteHalls().catch(() => []),
      ]);
      setBookings(mine);
      setFavoriteHalls(favoriteData);
      setTimingDrafts(buildTimingDrafts(mine));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isAdminRoute]);

  const runAvailabilitySearch = useCallback(async () => {
    setActionError(null);
    setActionSuccess(null);
    setSelectedSlotRange(null);

    const minimumDate = getMinimumSearchDate();
    if (searchDate < minimumDate) {
      setActionError("Search date cannot be in the past.");
      return;
    }

    const searchWindow = getSearchWindow(searchDate);

    setIsSearching(true);
    try {
      const normalizedTerm = hallSearchTerm.trim().toLowerCase();
      const exactHall = halls.find(
        (hall) => hall.name.toLowerCase() === normalizedTerm,
      );
      const response = await searchAvailableHalls({
        start_datetime: searchWindow.start.toISOString(),
        end_datetime: searchWindow.end.toISOString(),
        ...(exactHall ? { hall_name: exactHall.name } : {}),
      });
      const results =
        normalizedTerm && !exactHall
          ? response.results.filter((hall) =>
              hall.hall_name.toLowerCase().includes(normalizedTerm),
            )
          : response.results;
      setSearchResults(results);
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [hallSearchTerm, halls, searchDate]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (user?.role !== "user" || isAdminRoute) return;

    const onHallDisabled = () => {
      void (async () => {
        await loadInitialData();
        if (searchResults !== null) {
          await runAvailabilitySearch();
        }
        setActionSuccess(
          "Your bookings were refreshed after a hall status update.",
        );
      })();
    };

    window.addEventListener("hall-disabled", onHallDisabled);
    return () => {
      window.removeEventListener("hall-disabled", onHallDisabled);
    };
  }, [
    user?.role,
    isAdminRoute,
    loadInitialData,
    runAvailabilitySearch,
    searchResults,
  ]);

  useEffect(() => {
    const minimumDate = getMinimumSearchDate();
    if (searchDate < minimumDate) {
      setSearchDate(minimumDate);
    }
  }, [searchDate]);

  if (!user) return <Navigate to="/" replace />;
  if (user.role === "admin" && !isAdminRoute)
    return <Navigate to="/admin/bookings" replace />;
  if (user.role === "user" && isAdminRoute)
    return <Navigate to="/user/bookings" replace />;

  function buildSlotCells(hall: AvailableHall) {
    const { start: searchStart, end: searchEnd } = getSearchWindow(searchDate);
    const cells: SlotCell[] = [];
    let index = 0;

    for (
      let cursor = new Date(searchStart);
      cursor < searchEnd;
      cursor = addMinutes(cursor, SLOT_MINUTES)
    ) {
      const slotEnd = addMinutes(cursor, SLOT_MINUTES);
      const isAvailable =
        slotEnd <= searchEnd &&
        hall.available_slots.some((slot) => {
          const availableStart = parseApiDate(slot.start_time);
          const availableEnd = parseApiDate(slot.end_time);
          return cursor >= availableStart && slotEnd <= availableEnd;
        });

      cells.push({
        key: `${hall.hall_id}-${cursor.toISOString()}`,
        index,
        label: formatSlotLabel(cursor),
        start: new Date(cursor),
        end: slotEnd,
        isAvailable,
      });
      index += 1;
    }

    return cells;
  }

  function getOrderedRange(range: NonNullable<SelectedSlotRange>) {
    return {
      startIndex: Math.min(range.startIndex, range.endIndex),
      endIndex: Math.max(range.startIndex, range.endIndex),
    };
  }

  function getSelectedSlots(hallId: string, slotCells: SlotCell[]) {
    if (!selectedSlotRange || selectedSlotRange.hallId !== hallId) return [];
    const { startIndex, endIndex } = getOrderedRange(selectedSlotRange);
    return slotCells.filter(
      (slot) => slot.index >= startIndex && slot.index <= endIndex,
    );
  }

  function isSlotSelected(hallId: string, slot: SlotCell) {
    if (!selectedSlotRange || selectedSlotRange.hallId !== hallId) return false;
    const { startIndex, endIndex } = getOrderedRange(selectedSlotRange);
    return slot.index >= startIndex && slot.index <= endIndex;
  }

  function selectedRangeIsAvailable(hallId: string, slotCells: SlotCell[]) {
    const selectedSlots = getSelectedSlots(hallId, slotCells);
    return (
      selectedSlots.length > 0 &&
      selectedSlots.every((slot) => slot.isAvailable)
    );
  }

  async function handleLogout() {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    await runAvailabilitySearch();
  }

  function handleSlotPointerDown(
    event: PointerEvent<HTMLButtonElement>,
    hall: AvailableHall,
    slot: SlotCell,
  ) {
    if (!slot.isAvailable || bookingSlotKey || isLoading || isSearching) return;
    event.preventDefault();
    setSelectedSlotRange({
      hallId: hall.hall_id,
      startIndex: slot.index,
      endIndex: slot.index,
    });
    setIsSelectingSlots(true);
    setActionError(null);
    setActionSuccess(null);
  }

  function handleSlotPointerEnter(hall: AvailableHall, slot: SlotCell) {
    if (!isSelectingSlots || !slot.isAvailable) return;
    setSelectedSlotRange((current) => {
      if (!current || current.hallId !== hall.hall_id) return current;
      return { ...current, endIndex: slot.index };
    });
  }

  function handleSlotPointerUp() {
    setIsSelectingSlots(false);
  }

  async function handleSelectedSlotBooking(
    hall: AvailableHall,
    slotCells: SlotCell[],
  ) {
    const selectedSlots = getSelectedSlots(hall.hall_id, slotCells);
    if (!selectedRangeIsAvailable(hall.hall_id, slotCells)) {
      setActionError("Select one continuous available range to book.");
      return;
    }

    const bookingStart = selectedSlots[0].start;
    const bookingEnd = selectedSlots[selectedSlots.length - 1].end;
    const slotKey = `${hall.hall_id}-${bookingStart.toISOString()}-${bookingEnd.toISOString()}`;
    setBookingSlotKey(slotKey);
    setActionError(null);
    setActionSuccess(null);

    try {
      await bookHall({
        hall_name: hall.hall_name,
        start_datetime: bookingStart.toISOString(),
        end_datetime: bookingEnd.toISOString(),
      });
      await loadInitialData();
      await runAvailabilitySearch();
      setActionSuccess(
        `${hall.hall_name} booked from ${formatSlotLabel(bookingStart)} to ${formatSlotLabel(bookingEnd)}.`,
      );
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setBookingSlotKey(null);
      setSelectedSlotRange(null);
    }
  }

  async function handleCancel(bookingId: string) {
    setActionError(null);
    setActionSuccess(null);
    try {
      await cancelBooking(bookingId);
      setBookings((current) =>
        current.filter((booking) => booking.id !== bookingId),
      );
      setActionSuccess("Booking cancelled successfully.");
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err));
    }
  }

  async function handleTimingUpdate(bookingId: string) {
    const draft = timingDrafts[bookingId];
    if (!draft?.start || !draft?.end) return;

    if (
      !isHalfHourDateTimeValue(draft.start) ||
      !isHalfHourDateTimeValue(draft.end)
    ) {
      setActionSuccess(null);
      setActionError(
        "Bookings can only start and end on the hour or half hour.",
      );
      return;
    }

    const draftStart = new Date(draft.start);
    const draftEnd = new Date(draft.end);
    if (draftStart >= draftEnd) {
      setActionSuccess(null);
      setActionError("Booking start time must be before the end time.");
      return;
    }

    if (draftStart < roundUpToHalfHour(new Date())) {
      setActionSuccess(null);
      setActionError("Booking start time cannot be in the past.");
      return;
    }

    setActionError(null);
    setActionSuccess(null);
    try {
      await updateBookingTiming(bookingId, {
        start_datetime: dateTimeLocalToIso(draft.start),
        end_datetime: dateTimeLocalToIso(draft.end),
      });
      await loadInitialData();
      if (searchResults) {
        await runAvailabilitySearch();
      }
      setActionSuccess("Booking timing updated successfully.");
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err));
    }
  }

  async function handleLoadUserBookings(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      const rows = await listUserBookings(userId);
      setBookings(rows);
      setTimingDrafts(buildTimingDrafts(rows));
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err));
    }
  }

  async function handleShowAllBookings() {
    setActionError(null);
    setActionSuccess(null);
    try {
      const rows = await listAllBookings();
      setBookings(rows);
      setTimingDrafts(buildTimingDrafts(rows));
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err));
    }
  }

  const profileDetails = !isAdminRoute ? (
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
            : "No favorite halls yet"}
        </dd>
      </div>
    </dl>
  ) : undefined;

  return (
    <AppShell profileDetails={profileDetails}>
      <section className="page-toolbar">
        <div>
          <p className="eyebrow">
            {isAdminRoute ? "Admin schedule" : "Member schedule"}
          </p>
          <h2>{pageTitle}</h2>
        </div>
        <div className="toolbar-actions">
          <Button
            type="button"
            variant="secondary"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate(isAdminRoute ? "/admin" : "/user")}
          >
            Dashboard
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
      {actionError ? (
        <div className="alert" role="alert">
          <span>{actionError}</span>
        </div>
      ) : null}
      {actionSuccess ? (
        <div className="success" role="status">
          <span>{actionSuccess}</span>
        </div>
      ) : null}
      {isLoading ? (
        <div className="empty-state">Loading bookings...</div>
      ) : null}

      <section
        className={`profile-strip ${
          user.role === "admin"
            ? "profile-strip--admin"
            : "profile-strip--member"
        }`}
      >
        <div>
          <span>Signed in</span>
          <strong>{user.name}</strong>
        </div>
        <span className="status-pill">{user.role}</span>
      </section>

      {!isAdminRoute ? (
        <section className="panel panel--wide">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Availability search</p>
              <h2>Find a hall to book</h2>
            </div>
            <span className="panel-icon" aria-hidden="true">
              <CalendarSearch size={20} />
            </span>
          </div>

          <form className="booking-search" onSubmit={handleSearch}>
            <label className="field">
              <span className="field__label">Hall</span>
              <select
                className="field__input"
                value={hallSearchTerm}
                onChange={(e) => setHallSearchTerm(e.target.value)}
                disabled={isLoading || isSearching}
              >
                <option value="">All halls</option>
                {sortedHallOptions.map((hall) => (
                  <option key={hall.id} value={hall.name}>
                    {favoriteHallIds.has(hall.id) ? "★ " : ""}
                    {hall.name}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Date"
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              min={getMinimumSearchDate()}
              required
              disabled={isLoading || isSearching}
            />
            <Button
              type="submit"
              icon={<Search size={16} />}
              disabled={isLoading || isSearching}
            >
              {isSearching ? "Searching" : "Search"}
            </Button>
          </form>

          <div className="slot-legend" aria-label="Calendar legend">
            <span>
              <i className="slot-dot slot-dot--available" />
              Available
            </span>
            <span>
              <i className="slot-dot slot-dot--blocked" />
              Unavailable
            </span>
          </div>

          {searchResults === null ? (
            <div className="empty-state">
              Search by date and hall to see all half-hour slots.
            </div>
          ) : searchResults.length === 0 ? (
            <div className="empty-state">
              No available halls match this search.
            </div>
          ) : (
            <div className="availability-results">
              {searchResults.map((hall) => {
                const slotCells = buildSlotCells(hall);
                const bookableCount = slotCells.filter(
                  (slot) => slot.isAvailable,
                ).length;
                const selectedSlots = getSelectedSlots(hall.hall_id, slotCells);
                const canBookSelection = selectedRangeIsAvailable(
                  hall.hall_id,
                  slotCells,
                );
                const selectedStart = selectedSlots[0]?.start;
                const selectedEnd =
                  selectedSlots[selectedSlots.length - 1]?.end;
                const selectedMinutes =
                  selectedStart && selectedEnd
                    ? Math.round(
                        (selectedEnd.getTime() - selectedStart.getTime()) /
                          60000,
                      )
                    : 0;
                return (
                  <article className="availability-card" key={hall.hall_id}>
                    <div className="availability-card__header">
                      <div>
                        <p className="eyebrow">Hall</p>
                        <h3>
                          {favoriteHallIds.has(hall.hall_id) ? (
                            <Star size={16} aria-label="Favorite hall" />
                          ) : null}
                          {hall.hall_name}
                        </h3>
                      </div>
                      <div className="availability-card__meta">
                        <span>{hall.capacity} seats</span>
                        <span>Floor {hall.floor}</span>
                        <span>{bookableCount} open starts</span>
                      </div>
                    </div>
                    {selectedSlots.length > 0 ? (
                      <div className="selection-summary">
                        <span>
                          {selectedStart && selectedEnd
                            ? `${formatSlotLabel(selectedStart)} - ${formatSlotLabel(selectedEnd)} (${formatDuration(selectedMinutes)})`
                            : "Select available slots"}
                        </span>
                        <Button
                          type="button"
                          icon={<CalendarCheck size={16} />}
                          disabled={
                            !canBookSelection ||
                            bookingSlotKey !== null ||
                            isLoading ||
                            isSearching
                          }
                          onClick={() =>
                            handleSelectedSlotBooking(hall, slotCells)
                          }
                        >
                          {bookingSlotKey ? "Booking" : "Book selected"}
                        </Button>
                      </div>
                    ) : null}
                    <div className="slot-calendar">
                      {slotCells.map((slot) => {
                        const selected = isSlotSelected(hall.hall_id, slot);
                        return (
                          <button
                            type="button"
                            key={slot.key}
                            className={`slot-button ${
                              slot.isAvailable
                                ? "slot-button--available"
                                : "slot-button--blocked"
                            } ${selected ? "slot-button--selected" : ""}`}
                            disabled={
                              !slot.isAvailable ||
                              bookingSlotKey !== null ||
                              isLoading ||
                              isSearching
                            }
                            onPointerDown={(event) =>
                              handleSlotPointerDown(event, hall, slot)
                            }
                            onPointerEnter={() =>
                              handleSlotPointerEnter(hall, slot)
                            }
                            onPointerUp={handleSlotPointerUp}
                            onPointerCancel={handleSlotPointerUp}
                            onClick={() => {
                              if (!slot.isAvailable) return;
                              setSelectedSlotRange({
                                hallId: hall.hall_id,
                                startIndex: slot.index,
                                endIndex: slot.index,
                              });
                            }}
                            aria-label={
                              slot.isAvailable
                                ? `Select ${hall.hall_name} from ${formatSlotLabel(slot.start)} to ${formatSlotLabel(slot.end)}`
                                : `${hall.hall_name} is unavailable from ${formatSlotLabel(slot.start)}`
                            }
                            title={
                              slot.isAvailable
                                ? `Select ${formatSlotLabel(slot.start)} to ${formatSlotLabel(slot.end)}`
                                : "Unavailable"
                            }
                          >
                            <span>{slot.label}</span>
                            <small>{slot.isAvailable ? "Open" : "Busy"}</small>
                          </button>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {isAdminRoute ? (
        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Lookup</p>
              <h2>View user bookings</h2>
            </div>
          </div>
          <form
            className="inline-form inline-form--wrap"
            onSubmit={handleLoadUserBookings}
          >
            <Input
              label="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Paste user ID"
              disabled={isLoading}
            />
            <div className="button-row">
              <Button
                type="submit"
                icon={<Search size={16} />}
                disabled={isLoading}
              >
                Load
              </Button>
              <Button
                type="button"
                variant="secondary"
                icon={<RotateCcw size={16} />}
                onClick={handleShowAllBookings}
                disabled={isLoading}
              >
                Show All
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="panel panel--wide">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Timeline</p>
            <h2>{isAdminRoute ? "Bookings" : "My bookings"}</h2>
          </div>
          <span className="status-pill">{bookings.length} total</span>
        </div>

        {isLoading ? null : bookings.length === 0 ? (
          <div className="empty-state">No bookings found.</div>
        ) : (
          <div className="booking-list">
            {bookings.map((booking) => (
              <article className="booking-card" key={booking.id}>
                <div className="booking-card__summary">
                  <div>
                    <h3>{booking.hall_name}</h3>
                    <p>
                      <Clock3 size={15} aria-hidden="true" />
                      {formatDateTime(booking.start_datetime)} -{" "}
                      {formatDateTime(booking.end_datetime)}
                    </p>
                    <div className="booking-meta">
                      <span className="status-pill">{booking.status}</span>
                      {isAdminRoute ? (
                        <span>
                          User: {booking.user_name ?? booking.user_id}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {!isAdminRoute ? (
                    <Button
                      type="button"
                      variant="danger"
                      icon={<XCircle size={16} />}
                      onClick={() => handleCancel(booking.id)}
                      disabled={isAdminRoute || isLoading}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>

                {!isAdminRoute ? (
                  <div className="booking-card__editor">
                    <div className="form-grid">
                      <Input
                        label="Update start"
                        type="datetime-local"
                        step={SLOT_MINUTES * 60}
                        min={getMinimumDateTimeLocalValue()}
                        value={timingDrafts[booking.id]?.start ?? ""}
                        disabled={isAdminRoute || isLoading}
                        onChange={(e) =>
                          setTimingDrafts((current) => ({
                            ...current,
                            [booking.id]: {
                              start: e.target.value,
                              end:
                                current[booking.id]?.end ??
                                toDateTimeLocalValue(booking.end_datetime),
                            },
                          }))
                        }
                      />
                      <Input
                        label="Update end"
                        type="datetime-local"
                        step={SLOT_MINUTES * 60}
                        min={getMinimumDateTimeLocalValue()}
                        value={timingDrafts[booking.id]?.end ?? ""}
                        disabled={isAdminRoute || isLoading}
                        onChange={(e) =>
                          setTimingDrafts((current) => ({
                            ...current,
                            [booking.id]: {
                              start:
                                current[booking.id]?.start ??
                                toDateTimeLocalValue(booking.start_datetime),
                              end: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      icon={<CalendarCheck size={16} />}
                      onClick={() => handleTimingUpdate(booking.id)}
                      disabled={isAdminRoute || isLoading}
                    >
                      Update Timing
                    </Button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
