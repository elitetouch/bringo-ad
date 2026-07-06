import { apiGet } from "@/lib/api";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { reactivateUser, suspendUser } from "@/lib/actions/resources";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  type: string;
  roles: { name: string }[];
};

type UsersResponse = {
  users: {
    data: UserRow[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.role) query.set("role", params.role);
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);

  const { data } = await apiGet<UsersResponse>(`/admin/users?${query.toString()}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">All customers, merchants, and shoppers on the platform.</p>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="search"
          defaultValue={params.search}
          placeholder="Search name, email, phone…"
          className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <select
          name="role"
          defaultValue={params.role ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          <option value="customer">Customer</option>
          <option value="merchant">Merchant</option>
          <option value="shopper">Shopper</option>
          <option value="admin">Admin</option>
        </select>
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Roles</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.users.data.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3 text-gray-600">
                  {user.roles.map((r) => r.name).join(", ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-4 py-3">
                  {user.status === "active" ? (
                    <form action={suspendUser}>
                      <input type="hidden" name="id" value={user.id} />
                      <SubmitButton variant="danger">Suspend</SubmitButton>
                    </form>
                  ) : (
                    <form action={reactivateUser}>
                      <input type="hidden" name="id" value={user.id} />
                      <SubmitButton variant="success">Reactivate</SubmitButton>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {data.users.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination meta={data.users} basePath="/users" />
      </div>
    </div>
  );
}
