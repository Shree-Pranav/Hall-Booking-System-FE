import axios, { AxiosHeaders } from "axios";

import { env } from "../config/env";
import { getApiErrorMessage } from "../services/apiError";
import { showToast } from "../components/ui/toast";
import { clearAccessToken, getAccessToken } from "./authToken";

export function createApiClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    headers: {
      Accept: "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
      const headers = AxiosHeaders.from(config.headers);
      headers.set("Authorization", `Bearer ${token}`);
      config.headers = headers;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          clearAccessToken();
        }

        const shouldSkipToast = Boolean(error.config?.skipErrorToast);
        if (!shouldSkipToast) {
          showToast({
            title: "Request failed",
            description: getApiErrorMessage(error),
            variant: "error",
          });
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
}
// Use relative path to go through Vite proxy during dev
export const apiClient = createApiClient(env.bookingApiBaseUrl);
