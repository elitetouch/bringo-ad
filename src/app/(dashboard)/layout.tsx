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
