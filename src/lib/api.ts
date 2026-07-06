import "server-only";
import { getToken } from "@/lib/session";
import { API_BASE_URL } from "@/lib/config";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

/**
 * Server-only fetch wrapper. Attaches the admin's Sanctum token (read from the
 * httpOnly session cookie) so the browser itself never sees the bearer token.
 */
export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const token = await getToken();

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const json = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok) {
    throw new ApiError(response.status, json.message ?? "Request failed.", json);
  }

  return json;
}

export function apiGet<T = unknown>(path: string) {
  return apiFetch<T>(path);
}

export function apiPatch<T = unknown>(path: string, body?: Record<string, unknown>) {
  return apiFetch<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined });
}

export function apiPost<T = unknown>(path: string, body?: Record<string, unknown>) {
  return apiFetch<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
}
