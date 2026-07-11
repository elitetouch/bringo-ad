import { apiGet } from "@/lib/api";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { toggleStoreOutletActive } from "@/lib/actions/resources";

type OutletRow = {
  id: string;
  name: string;
  city: string | null;
  is_active: boolean;
  status: string;
  store_logo_url: string | null;
  store_brand: { name: string; merchant: { business_name: string | null } | null } | null;
  country: { name: string; iso2: string } | null;
};

type OutletsResponse = {
  storeOutlets: {
    data: OutletRow[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
};

export default async function StoreOutletsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.search) query.set("search", params.search);

  const { data } = await apiGet<OutletsResponse>(`/admin/store-outlets?${query.toString()}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Store Outlets</h1>
        <p className="text-sm text-gray-500">Physical outlets across all merchants.</p>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="search"
          defaultValue={params.search}
          placeholder="Search outlet name…"
          className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Outlet</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Brand / Merchant</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Country</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.storeOutlets.data.map((outlet) => (
              <tr key={outlet.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    {outlet.store_logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={outlet.store_logo_url}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                        {outlet.name.charAt(0)}
                      </div>
                    )}
                    <span>
                      {outlet.name}
                      {outlet.city && <span className="ml-1 text-xs text-gray-400">({outlet.city})</span>}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {outlet.store_brand?.name}
                  {outlet.store_brand?.merchant?.business_name
                    ? ` · ${outlet.store_brand.merchant.business_name}`
                    : ""}
                </td>
                <td className="px-4 py-3 text-gray-600">{outlet.country?.iso2 || "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={outlet.is_active ? "active" : "suspended"} />
                </td>
                <td className="px-4 py-3">
                  <form action={toggleStoreOutletActive}>
                    <input type="hidden" name="id" value={outlet.id} />
                    <input type="hidden" name="is_active" value={(!outlet.is_active).toString()} />
                    <SubmitButton variant={outlet.is_active ? "danger" : "success"}>
                      {outlet.is_active ? "Deactivate" : "Activate"}
                    </SubmitButton>
                  </form>
                </td>
              </tr>
            ))}
            {data.storeOutlets.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No store outlets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination meta={data.storeOutlets} basePath="/store-outlets" />
      </div>
    </div>
  );
}
