"use server";

import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";
import { clearToken, setToken } from "@/lib/session";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  let token: string;
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const json = await response.json();

    if (!response.ok || !json?.data?.token) {
      return { error: json?.message ?? "Invalid credentials." };
    }

    token = json.data.token as string;
  } catch {
    return { error: "Unable to reach the API. Please try again." };
  }

  // Confirm the admin role before granting a session — never trust the client for this.
  await setToken(token);

  try {
    const profile = await apiFetch<{ user: { roles: string[] } }>("/profile");
    const roles = profile.data.user.roles ?? [];

    if (!roles.includes("admin")) {
      await clearToken();
      return { error: "This account does not have super admin access." };
    }
  } catch (err) {
    await clearToken();
    return { error: err instanceof ApiError ? err.message : "Unable to verify account." };
  }

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  try {
    await apiFetch("/logout", { method: "POST" });
  } catch {
    // best-effort: even if the remote token revoke fails, clear the local session
  }
  await clearToken();
  redirect("/login");
}
