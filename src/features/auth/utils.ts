import type { TokenPayload } from "./types/auth.types";

export function decodeToken(token: string | null): TokenPayload | null {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalizedPayload);
    return JSON.parse(decoded) as TokenPayload;
  } catch {
    return null;
  }
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
