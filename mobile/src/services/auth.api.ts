import type { AuthResponse } from "@/types/auth";
import { ApiError, UNEXPECTED_ERROR_MESSAGE, isRecord, postJson } from "./http";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

function isAuthResponse(value: unknown): value is AuthResponse {
  return (
    isRecord(value) &&
    typeof value.token === "string" &&
    isRecord(value.user) &&
    typeof value.user.id === "string"
  );
}

async function postAuth(path: string, body: LoginPayload | RegisterPayload): Promise<AuthResponse> {
  const data = await postJson(path, body);
  if (!isAuthResponse(data)) {
    throw new ApiError(500, UNEXPECTED_ERROR_MESSAGE);
  }
  return data;
}

export const authApi = {
  login: (payload: LoginPayload) => postAuth("/api/auth/login", payload),
  register: (payload: RegisterPayload) => postAuth("/api/auth/register", payload),
};
