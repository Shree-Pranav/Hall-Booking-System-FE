import { Layers, UsersRound } from "lucide-react";

import type { Hall } from "../services/hallsService";
import { HallActions } from "./HallActions";

type Props = {
  halls: Hall[];
  favoriteHallIds?: Set<string>;
  onToggleActive?: (hall: Hall) => void;
  onEdit?: (hall: Hall) => void;
  showActions?: boolean;
};

export function HallList({
  halls,
  favoriteHallIds,
  onToggleActive,
  onEdit,
  showActions = false,
}: Props) {
  if (!halls || halls.length === 0) {
    return <div className="empty-state">No halls found.</div>;
  }

  return (
    <div className="hall-grid">
      {halls.map((hall) => (
        <article
          className={`hall-card ${hall.is_active ? "" : "hall-card--inactive"}`}
          key={hall.id}
        >
          <div className="hall-card__header">
            <div>
              <p className="eyebrow">Hall</p>
              <h3>{hall.name}</h3>
            </div>
            <div className="hall-card__badges">
              <span className="hall-card__floor">Floor {hall.floor}</span>
              {showActions ? (
                <span
                  className={`status-pill ${
                    hall.is_active ? "status-pill--ok" : "status-pill--error"
                  }`}
                >
                  {hall.is_active ? "Enabled" : "Disabled"}
                </span>
              ) : null}
            </div>
          </div>

          <div className="hall-card__stats">
            <span>
              <UsersRound size={16} aria-hidden="true" />
              {hall.capacity} seats
            </span>
            <span>
              <Layers size={16} aria-hidden="true" />
              Level {hall.floor}
            </span>
          </div>

          {hall.facilities && hall.facilities.length > 0 ? (
            <div className="hall-card__facilities">
              {hall.facilities.map((facility) => (
                <span key={String(facility.facility.id)}>
                  {facility.facility.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">No facilities assigned.</p>
          )}

          <HallActions
            hall={hall}
            showActions={showActions}
            initialIsFavorite={favoriteHallIds?.has(hall.id) ?? false}
            onEdit={onEdit}
            onToggleActive={onToggleActive}
          />
        </article>
      ))}
    </div>
  );
}
