import { useEffect, useState } from "react";

import { subscribeToToasts, type ToastItem } from "./toast";

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToToasts((toast) => {
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, toast.durationMs);
    });
  }, []);

  return (
    <div className="toaster" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <article className={`toast toast--${toast.variant}`} key={toast.id}>
          <strong>{toast.title}</strong>
          <span>{toast.description}</span>
        </article>
      ))}
    </div>
  );
}
