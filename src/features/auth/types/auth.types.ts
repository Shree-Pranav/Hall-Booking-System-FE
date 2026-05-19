export type UserRole = "admin" | "user";

export type User = {
  id: string;
  name: string;
  is_active: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type CreateUserRequest = {
  name: string;
  password: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type UpdateUserRequest = {
  id: string;
  name?: string;
  password?: string;
  is_active?: boolean;
};

export type TokenResponse = {
  access_token: string;
  token_type: "bearer" | string;
  user: User;
};

export type TokenPayload = {
  user_id?: string;
  role?: UserRole;
  exp?: number;
};

export type HealthResponse = {
  status: "ok" | "error" | string;
  message?: string;
};
