import { API_URL } from "./config";

export const NETWORK_ERROR_MESSAGE = "Error de red. Intenta nuevamente";
export const UNEXPECTED_ERROR_MESSAGE = "Ocurrió un error inesperado. Intenta nuevamente";
const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor() {
    super(NETWORK_ERROR_MESSAGE);
    this.name = "NetworkError";
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractMessage(data: unknown): string | null {
  return isRecord(data) && typeof data.message === "string" ? data.message : null;
}

interface RequestOptions {
  method: "GET" | "POST" | "DELETE";
  path: string;
  body?: unknown;
  token?: string;
}

// Si se pasa `token`, se envía como `Authorization: Bearer <token>`.
// Devuelve el cuerpo sin validar: cada API valida el contrato que espera.
async function requestJson({ method, path, body, token }: RequestOptions): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Sin timeout, un servidor inalcanzable deja el spinner girando indefinidamente.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
  } catch {
    throw new NetworkError();
  } finally {
    clearTimeout(timeoutId);
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, extractMessage(data) ?? UNEXPECTED_ERROR_MESSAGE);
  }
  return data;
}

export function postJson(path: string, body: unknown, token?: string): Promise<unknown> {
  return requestJson({ method: "POST", path, body, ...(token ? { token } : {}) });
}

export function getJson(path: string, token: string): Promise<unknown> {
  return requestJson({ method: "GET", path, token });
}

export function deleteJson(path: string, token: string): Promise<unknown> {
  return requestJson({ method: "DELETE", path, token });
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof NetworkError) {
    return error.message;
  }
  return UNEXPECTED_ERROR_MESSAGE;
}
