import { env } from "../../../config/env";
import { createApiClient } from "../../../lib/axios";
import type {
  CreateUserRequest,
  LoginRequest,
  TokenResponse,
  User,
} from "../types/auth.types";

const authApiClient = createApiClient(env.authApiBaseUrl);

export async function createUser(payload: CreateUserRequest): Promise<User> {
  const response = await authApiClient.post<User>("/users", payload);
  return response.data;
}

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.set("username", payload.username);
  formData.set("password", payload.password);

  const response = await authApiClient.post<TokenResponse>(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  return response.data;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await authApiClient.get<User>("/auth/me");
    return response.data;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "isAxiosError" in error &&
      (error as { isAxiosError?: boolean }).isAxiosError &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 401
    ) {
      return null;
    }

    throw error;
  }
}

export async function logout(): Promise<void> {
  await authApiClient.post("/auth/logout");
}
