import axios from "axios";

import { getApiErrorMessage } from "../services/apiError";
import { showToast } from "../components/ui/toast";

export function createApiClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      Accept: "application/json",
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
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
export const apiClient = createApiClient("/api");
