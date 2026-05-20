import React, { useState } from "react";
import type { Hall } from "../services/hallsService";
import { useAuth } from "../../../context/AuthContext";
import { addFavorite, removeFavorite } from "../services/hallsService";

type Props = {
  halls: Hall[];
  onDelete?: (id: string) => void;
  onEdit?: (hall: Hall) => void;
  showActions?: boolean;
};

export function HallList({
  halls,
  onDelete,
  onEdit,
  showActions = false,
}: Props) {
  if (!halls || halls.length === 0) {
    return <div>No halls found.</div>;
  }

  return (
    <div className="panel">
      <ul style={{ listStyle: "none", padding: 0 }}>
        {halls.map((h) => (
          <li
            key={h.id}
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 4,
              border: "1px solid #ddd",
              backgroundColor: "#f9f9f9",
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: "1.1em" }}>{h.name}</strong>
            </div>
            <div style={{ fontSize: "0.9em", color: "#666" }}>
              Capacity: {h.capacity} | Floor: {h.floor}
            </div>

            {h.facilities && h.facilities.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                <strong>Facilities:</strong>
                <ul style={{ margin: 4, paddingLeft: 18 }}>
                  {h.facilities.map((f) => (
                    <li
                      key={String(f.facility.id)}
                      style={{ fontSize: "0.9em" }}
                    >
                      {f.facility.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <HallActions
              hall={h}
              showActions={showActions}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function HallActions({
  hall,
  showActions,
  onEdit,
  onDelete,
}: {
  hall: Hall;
  showActions: boolean;
  onEdit?: (h: Hall) => void;
  onDelete?: (id: string) => void;
}) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAddFav() {
    setLoading(true);
    try {
      await addFavorite(hall.name);
      setIsFav(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFav() {
    setLoading(true);
    try {
      await removeFavorite(hall.name);
      setIsFav(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      {user?.role === "user" ? (
        <button
          onClick={isFav ? handleRemoveFav : handleAddFav}
          disabled={loading}
          style={{
            padding: "6px 12px",
            marginRight: 8,
            backgroundColor: isFav ? "#ffc107" : "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {isFav ? "Remove Favorite" : "Add Favorite"}
        </button>
      ) : null}

      {showActions ? (
        <>
          <button
            onClick={() => onEdit?.(hall)}
            style={{
              padding: "6px 12px",
              marginRight: 8,
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete?.(hall.id)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </>
      ) : null}
    </div>
  );
}
