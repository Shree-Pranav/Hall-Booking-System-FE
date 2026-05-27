const DEFAULT_AUTH_API_BASE_URL = "http://localhost:8000";
const DEFAULT_BOOKING_API_BASE_URL = "/api";

export const env = {
  authApiBaseUrl:
    import.meta.env.VITE_AUTH_API_BASE_URL?.replace(/\/$/, "") ??
    DEFAULT_AUTH_API_BASE_URL,
  bookingApiBaseUrl:
    import.meta.env.VITE_BOOKING_API_BASE_URL?.replace(/\/$/, "") ??
    DEFAULT_BOOKING_API_BASE_URL,
};
