import { apiGet } from "@/lib/api";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";

type SubscriptionRow = {
  id: string;
  status: string;
  interval: string;
  currency: string;
  amount_paid: number;
  starts_at: string | null;
  ends_at: string | null;
  user: { name: string; email: string } | null;
  plan: { name: string; code: string } | null;
  country: { iso2: string } | null;
};

type SubscriptionsResponse = {
  subscriptions: {
    data: SubscriptionRow[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
};

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.status) query.set("status", params.status);

  const { data } = await apiGet<SubscriptionsResponse>(`/admin/subscriptions?${query.toString()}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Subscriptions</h1>
        <p className="text-sm text-gray-500">Read-only oversight of customer subscriptions.</p>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="canceled">Canceled</option>
        </select>
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Plan</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Country</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Amount paid</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Ends</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.subscriptions.data.map((sub) => (
              <tr key={sub.id}>
                <td className="px-4 py-3 text-gray-600">
                  {sub.user ? `${sub.user.name} · ${sub.user.email}` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{sub.plan?.name} ({sub.interval})</td>
                <td className="px-4 py-3 text-gray-600">{sub.country?.iso2 || "—"}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {sub.currency} {(sub.amount_paid / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {sub.ends_at ? new Date(sub.ends_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {data.subscriptions.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No subscriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination meta={data.subscriptions} basePath="/subscriptions" />
      </div>
    </div>
  );
}
