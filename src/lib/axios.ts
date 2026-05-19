import axios from "axios";

import { AUTH_TOKEN_STORAGE_KEY } from "../config/constants";

// Use relative path to go through Vite proxy during dev
export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    Accept: "application/json",
  },
});

export function setAuthToken(token: string) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete apiClient.defaults.headers.common.Authorization;
}

const savedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

if (savedToken) {
  setAuthToken(savedToken);
}
