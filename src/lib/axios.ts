import axios from "axios";

export function createApiClient(baseURL: string) {
  return axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      Accept: "application/json",
    },
  });
}

// Use relative path to go through Vite proxy during dev
export const apiClient = createApiClient("/api");
