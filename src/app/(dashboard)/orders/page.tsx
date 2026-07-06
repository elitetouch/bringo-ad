import { apiGet } from "@/lib/api";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";

type OrderRow = {
  id: string;
  status: string;
  total: string;
  currency: string;
  created_at: string;
  user: { name: string; email: string } | null;
  outlet: { name: string } | null;
  brand: { name: string } | null;
};

type OrdersResponse = {
  orders: {
    data: OrderRow[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.status) query.set("status", params.status);

  const { data } = await apiGet<OrdersResponse>(`/admin/orders?${query.toString()}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">Read-only oversight of all customer orders.</p>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending_payment">Pending payment</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="canceled">Canceled</option>
          <option value="expired">Expired</option>
          <option value="payment_failed">Payment failed</option>
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
              <th className="px-4 py-3 text-left font-medium text-gray-500">Outlet</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Total</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.orders.data.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 text-gray-600">
                  {order.user ? `${order.user.name} · ${order.user.email}` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {order.outlet?.name} {order.brand?.name ? `(${order.brand.name})` : ""}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {order.currency} {order.total}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {data.orders.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination meta={data.orders} basePath="/orders" />
      </div>
    </div>
  );
}
