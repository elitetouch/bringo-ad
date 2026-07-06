import { apiGet } from "@/lib/api";

type DashboardSummary = {
  users: { total: number; customers: number; merchants: number; shoppers: number; suspended: number };
  merchants: { pending: number; approved: number; suspended: number };
  shoppers: { pending: number; approved: number };
  kyc_documents: { pending: number };
  subscriptions: { active: number };
  orders: { today: number; total: number };
};

function Card({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ?? "text-gray-900"}`}>{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const { data } = await apiGet<DashboardSummary>("/admin/dashboard");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Platform overview at a glance.</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Users</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Card label="Total users" value={data.users.total} />
          <Card label="Customers" value={data.users.customers} />
          <Card label="Merchants" value={data.users.merchants} />
          <Card label="Shoppers" value={data.users.shoppers} />
          <Card label="Suspended" value={data.users.suspended} accent="text-danger-600" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Merchants</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card label="Pending approval" value={data.merchants.pending} accent="text-warning-600" />
          <Card label="Approved" value={data.merchants.approved} accent="text-success-600" />
          <Card label="Suspended" value={data.merchants.suspended} accent="text-danger-600" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Shoppers &amp; KYC</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card label="Pending shoppers" value={data.shoppers.pending} accent="text-warning-600" />
          <Card label="Approved shoppers" value={data.shoppers.approved} accent="text-success-600" />
          <Card label="Pending KYC docs" value={data.kyc_documents.pending} accent="text-warning-600" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Subscriptions &amp; Orders
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card label="Active subscriptions" value={data.subscriptions.active} accent="text-success-600" />
          <Card label="Orders today" value={data.orders.today} />
          <Card label="Orders total" value={data.orders.total} />
        </div>
      </section>
    </div>
  );
}
