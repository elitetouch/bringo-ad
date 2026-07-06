import { apiGet } from "@/lib/api";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { approveMerchant, rejectMerchant, suspendMerchant } from "@/lib/actions/resources";

type MerchantRow = {
  id: string;
  business_name: string | null;
  business_email: string | null;
  status: string;
  user: { name: string; email: string } | null;
};

type MerchantsResponse = {
  merchants: {
    data: MerchantRow[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
};

export default async function MerchantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.status) query.set("status", params.status);

  const { data } = await apiGet<MerchantsResponse>(`/admin/merchants?${query.toString()}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Merchants</h1>
        <p className="text-sm text-gray-500">Approve, reject, or suspend merchant accounts.</p>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Business</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Owner</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.merchants.data.map((merchant) => (
              <tr key={merchant.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {merchant.business_name || "(no business name yet)"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {merchant.user ? `${merchant.user.name} · ${merchant.user.email}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={merchant.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {merchant.status !== "approved" && (
                      <form action={approveMerchant}>
                        <input type="hidden" name="id" value={merchant.id} />
                        <SubmitButton variant="success">Approve</SubmitButton>
                      </form>
                    )}
                    {merchant.status !== "rejected" && (
                      <form action={rejectMerchant}>
                        <input type="hidden" name="id" value={merchant.id} />
                        <SubmitButton variant="danger">Reject</SubmitButton>
                      </form>
                    )}
                    {merchant.status !== "suspended" && (
                      <form action={suspendMerchant}>
                        <input type="hidden" name="id" value={merchant.id} />
                        <SubmitButton variant="neutral">Suspend</SubmitButton>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {data.merchants.data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No merchants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination meta={data.merchants} basePath="/merchants" />
      </div>
    </div>
  );
}
