import { apiGet } from "@/lib/api";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { toggleProductActive } from "@/lib/actions/resources";

type ProductRow = {
  id: string;
  title: string;
  publish_state: string;
  is_active: boolean;
  storeBrand: { name: string; merchant: { business_name: string | null } | null } | null;
  category: { name: string } | null;
  primaryImage: { url: string } | null;
};

type ProductsResponse = {
  products: {
    data: ProductRow[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.search) query.set("search", params.search);

  const { data } = await apiGet<ProductsResponse>(`/admin/products?${query.toString()}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500">Catalog moderation across all merchants.</p>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="search"
          defaultValue={params.search}
          placeholder="Search product title…"
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
              <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Brand / Merchant</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Publish state</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Active</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.products.data.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {product.primaryImage?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.primaryImage.url} alt="" className="h-8 w-8 rounded object-cover" />
                    )}
                    <span className="font-medium text-gray-900">{product.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {product.storeBrand?.name}
                  {product.storeBrand?.merchant?.business_name
                    ? ` · ${product.storeBrand.merchant.business_name}`
                    : ""}
                </td>
                <td className="px-4 py-3 text-gray-600">{product.category?.name || "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={product.publish_state} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={product.is_active ? "active" : "suspended"} />
                </td>
                <td className="px-4 py-3">
                  <form action={toggleProductActive}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="is_active" value={(!product.is_active).toString()} />
                    <SubmitButton variant={product.is_active ? "danger" : "success"}>
                      {product.is_active ? "Deactivate" : "Activate"}
                    </SubmitButton>
                  </form>
                </td>
              </tr>
            ))}
            {data.products.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination meta={data.products} basePath="/products" />
      </div>
    </div>
  );
}
