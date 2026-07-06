import { redirect } from "next/navigation";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/session";
import { LoginForm } from "./LoginForm";

type Profile = { user: { roles: string[] } };

export default async function LoginPage() {
  // Only bother checking if a token cookie exists at all — avoids a wasted API
  // call on the common case (no session yet).
  let isValidAdmin = false;

  if (await getToken()) {
    try {
      const res = await apiGet<Profile>("/profile");
      isValidAdmin = res.data.user.roles?.includes("admin") ?? false;
    } catch {
      // stale/invalid token — fall through and show the login form, a fresh
      // login will overwrite the bad cookie
    }
  }

  // redirect() throws internally, so it must not be called from inside the
  // try/catch above or its own throw would get swallowed as "stale token".
  if (isValidAdmin) {
    redirect("/");
  }

  return <LoginForm />;
}
