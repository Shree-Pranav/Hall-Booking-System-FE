import axios from "axios";

// Use relative path to go through Vite proxy during dev
export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});
