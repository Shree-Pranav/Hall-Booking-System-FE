export type ToastVariant = "success" | "error" | "info";

export type ToastInput = {
  title: string;
  description: string;
  variant?: ToastVariant;
  durationMs?: number;
};

export type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
  durationMs: number;
};

type ToastListener = (toast: ToastItem) => void;

const listeners = new Set<ToastListener>();

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function subscribeToToasts(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function showToast(input: ToastInput): ToastItem {
  const toast: ToastItem = {
    id: createToastId(),
    variant: input.variant ?? "info",
    durationMs: input.durationMs ?? 4500,
    title: input.title,
    description: input.description,
  };

  listeners.forEach((listener) => listener(toast));
  return toast;
}
