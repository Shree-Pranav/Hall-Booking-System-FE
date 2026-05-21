import { useEffect, useState } from "react";
import { Edit3, Heart, HeartOff, Power, PowerOff } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";
import { getApiErrorMessage } from "../../../services/apiError";
import { addFavorite, removeFavorite } from "../services/hallsService";
import type { Hall } from "../services/hallsService";

type HallActionsProps = {
  hall: Hall;
  showActions: boolean;
  initialIsFavorite?: boolean;
  onEdit?: (hall: Hall) => void;
  onToggleActive?: (hall: Hall) => void;
};

export function HallActions({
  hall,
  showActions,
  initialIsFavorite = false,
  onEdit,
  onToggleActive,
}: HallActionsProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  async function handleAddFav() {
    setLoading(true);
    setError(null);
    try {
      await addFavorite(hall.name);
      setIsFavorite(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFav() {
    setLoading(true);
    setError(null);
    try {
      await removeFavorite(hall.name);
      setIsFavorite(false);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hall-actions">
      <div className="button-row">
        {user?.role === "user" ? (
          <Button
            type="button"
            variant={isFavorite ? "secondary" : "primary"}
            icon={isFavorite ? <HeartOff size={16} /> : <Heart size={16} />}
            onClick={isFavorite ? handleRemoveFav : handleAddFav}
            disabled={loading}
          >
            {isFavorite ? "Remove Favorite" : "Add Favorite"}
          </Button>
        ) : null}

        {showActions ? (
          <>
            <Button
              type="button"
              variant="secondary"
              icon={<Edit3 size={16} />}
              onClick={() => onEdit?.(hall)}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant={hall.is_active ? "danger" : "primary"}
              icon={hall.is_active ? <PowerOff size={16} /> : <Power size={16} />}
              onClick={() => onToggleActive?.(hall)}
            >
              {hall.is_active ? "Disable" : "Enable"}
            </Button>
          </>
        ) : null}
      </div>

      {error ? (
        <div className="alert alert--compact" role="alert">
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}
