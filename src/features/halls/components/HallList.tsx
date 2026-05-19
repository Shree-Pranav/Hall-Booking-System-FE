import React from "react";
import type { Hall } from "../services/hallsService";

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
  if (halls.length === 0) {
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
            {showActions ? (
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => onEdit?.(h)}
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
                  onClick={() => onDelete?.(h.id)}
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
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
