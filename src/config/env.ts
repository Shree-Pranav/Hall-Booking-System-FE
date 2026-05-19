const DEFAULT_AUTH_API_BASE_URL = "http://localhost:8000";

export const env = {
  authApiBaseUrl:
    import.meta.env.VITE_AUTH_API_BASE_URL?.replace(/\/$/, "") ??
    DEFAULT_AUTH_API_BASE_URL,
};
