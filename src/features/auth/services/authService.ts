import { apiClient } from "../../../lib/axios";
import type {
  CreateUserRequest,
  LoginRequest,
  TokenResponse,
  User,
} from "../types/auth.types";

export async function createUser(payload: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<User>("/users", payload);
  return response.data;
}

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.set("username", payload.username);
  formData.set("password", payload.password);

  const response = await apiClient.post<TokenResponse>(
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
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return null;
    }

    throw error;
  }
}
