import { apiGet } from "@/lib/api";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { toggleStoreBrandActive } from "@/lib/actions/resources";

type BrandRow = {
  id: string;
  name: string;
  category: string;
  is_active: boolean;
  merchant: { business_name: string | null; status: string } | null;
};

type BrandsResponse = {
  storeBrands: {
    data: BrandRow[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
};

export default async function StoreBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.search) query.set("search", params.search);

  const { data } = await apiGet<BrandsResponse>(`/admin/store-brands?${query.toString()}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Store Brands</h1>
        <p className="text-sm text-gray-500">Oversight of merchant store brands.</p>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="search"
          defaultValue={params.search}
          placeholder="Search brand name…"
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
              <th className="px-4 py-3 text-left font-medium text-gray-500">Brand</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Merchant</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Active</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.storeBrands.data.map((brand) => (
              <tr key={brand.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{brand.name}</td>
                <td className="px-4 py-3 capitalize text-gray-600">{brand.category.replaceAll("_", " ")}</td>
                <td className="px-4 py-3 text-gray-600">{brand.merchant?.business_name || "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={brand.is_active ? "active" : "suspended"} />
                </td>
                <td className="px-4 py-3">
                  <form action={toggleStoreBrandActive}>
                    <input type="hidden" name="id" value={brand.id} />
                    <input type="hidden" name="is_active" value={(!brand.is_active).toString()} />
                    <SubmitButton variant={brand.is_active ? "danger" : "success"}>
                      {brand.is_active ? "Deactivate" : "Activate"}
                    </SubmitButton>
                  </form>
                </td>
              </tr>
            ))}
            {data.storeBrands.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No store brands found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination meta={data.storeBrands} basePath="/store-brands" />
      </div>
    </div>
  );
}
