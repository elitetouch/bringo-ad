import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { apiGet, ApiError } from "@/lib/api";

type Profile = { user: { name: string; email: string; roles: string[] } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let profile: Profile;

  try {
    const res = await apiGet<Profile>("/profile");
    profile = res.data;
  } catch (err) {
    // Note: we can't clear the stale/invalid session cookie here — Server
    // Components aren't allowed to mutate cookies. That's fine: proxy.ts
    // deliberately never bounces /login away just because a cookie exists,
    // so /login stays reachable and a fresh login overwrites the bad cookie.
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login");
    }
    throw err;
  }

  if (!profile.user.roles?.includes("admin")) {
    redirect("/login");
  }

  return <DashboardShell user={profile.user}>{children}</DashboardShell>;
}
