import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");

  const bookingBackendUrl =
    env.VITE_BOOKING_BACKEND_URL ?? "http://localhost:8001";
  const authBackendUrl = env.VITE_AUTH_BACKEND_URL ?? "http://localhost:8000";

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      open: false,
      proxy: {
        "/api/auth": {
          target: authBackendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/auth/, "/auth"),
        },
        "/api/halls": {
          target: bookingBackendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/halls/, "/halls"),
        },
        "/api/facilities": {
          target: bookingBackendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/facilities/, "/facilities"),
        },
        "/api/favorites": {
          target: bookingBackendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/favorites/, "/favorites"),
        },
        "/api/bookings": {
          target: bookingBackendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/bookings/, "/bookings"),
        },
        "/api/search": {
          target: bookingBackendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/search/, "/search"),
        },
        "/api/events": {
          target: bookingBackendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/events/, "/events"),
        },
      },
    },
  };
});
