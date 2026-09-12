import { apiGet } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { verifyOrderPayment, verifySubscriptionPayment } from "@/lib/actions/resources";

type PendingSubscriptionAttempt = {
  id: string;
  provider: string;
  reference: string;
  status: string;
  currency: string;
  customer_charged_subunit: number;
  interval: string;
  created_at: string | null;
  user: { name: string; email: string } | null;
  plan: { name: string; code: string } | null;
  country: { iso2: string } | null;
};

type PendingOrderAttempt = {
  id: string;
  provider: string;
  reference: string;
  status: string;
  currency: string;
  customer_charged_subunit: number;
  created_at: string | null;
  user: { name: string; email: string } | null;
  country: { iso2: string } | null;
};

type PendingListMeta = {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
};

type PendingSubscriptionsResponse = {
  attempts: { data: PendingSubscriptionAttempt[] } & PendingListMeta;
};

type PendingOrdersResponse = {
  attempts: { data: PendingOrderAttempt[] } & PendingListMeta;
};

const STATUS_OPTIONS = ["initialized", "redirected", "pending", "failed", "abandoned", "gateway_error"];

function SimplePager({
  meta,
  basePath,
  pageParam,
  preserve,
}: {
  meta: PendingListMeta;
  basePath: string;
  pageParam: string;
  preserve: URLSearchParams;
}) {
  if (meta.last_page <= 1) return null;

  const hasPrev = meta.current_page > 1;
  const hasNext = meta.current_page < meta.last_page;

  const linkFor = (page: number) => {
    const params = new URLSearchParams(preserve);
    params.set(pageParam, String(page));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
      <span>
        Page {meta.current_page} of {meta.last_page} · {meta.total} total
      </span>
      <div className="flex gap-2">
        <a
          href={hasPrev ? linkFor(meta.current_page - 1) : undefined}
          aria-disabled={!hasPrev}
          className={`rounded-md border px-3 py-1.5 ${
            hasPrev ? "border-gray-300 hover:bg-gray-50" : "pointer-events-none border-gray-200 text-gray-300"
          }`}
        >
          Previous
        </a>
        <a
          href={hasNext ? linkFor(meta.current_page + 1) : undefined}
          aria-disabled={!hasNext}
          className={`rounded-md border px-3 py-1.5 ${
            hasNext ? "border-gray-300 hover:bg-gray-50" : "pointer-events-none border-gray-200 text-gray-300"
          }`}
        >
          Next
        </a>
      </div>
    </div>
  );
}

export default async function PaymentVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{
    sub_page?: string;
    sub_status?: string;
    order_page?: string;
    order_status?: string;
    result?: string;
    message?: string;
  }>;
}) {
  const params = await searchParams;

  const subQuery = new URLSearchParams();
  if (params.sub_page) subQuery.set("page", params.sub_page);
  if (params.sub_status) subQuery.set("status", params.sub_status);

  const orderQuery = new URLSearchParams();
  if (params.order_page) orderQuery.set("page", params.order_page);
  if (params.order_status) orderQuery.set("status", params.order_status);

  const [{ data: subData }, { data: orderData }] = await Promise.all([
    apiGet<PendingSubscriptionsResponse>(`/admin/payments/subscriptions/pending?${subQuery.toString()}`),
    apiGet<PendingOrdersResponse>(`/admin/payments/orders/pending?${orderQuery.toString()}`),
  ]);

  const subPreserve = new URLSearchParams();
  if (params.sub_status) subPreserve.set("sub_status", params.sub_status);

  const orderPreserve = new URLSearchParams();
  if (params.order_status) orderPreserve.set("order_status", params.order_status);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Payment Verification</h1>
        <p className="text-sm text-gray-500">
          Pesapal payments stuck below &ldquo;paid&rdquo; - the browser callback or IPN never finalized them
          (customer closed the browser early, or the IPN delivery failed). Verify re-checks the payment
          directly with Pesapal and activates it if it actually went through. Safe to click more than once.
        </p>
      </div>

      {params.result && params.message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            params.result === "success"
              ? "border-success-200 bg-success-50 text-success-700"
              : "border-danger-200 bg-danger-50 text-danger-700"
          }`}
        >
          {params.message}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Subscription payments</h2>

        <form className="flex flex-wrap gap-3" method="get">
          <select
            name="sub_status"
            defaultValue={params.sub_status ?? ""}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
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
                <th className="px-4 py-3 text-left font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Reference</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subData.attempts.data.map((attempt) => (
                <tr key={attempt.id}>
                  <td className="px-4 py-3 text-gray-600">
                    {attempt.user ? `${attempt.user.name} · ${attempt.user.email}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {attempt.plan?.name} ({attempt.interval})
                  </td>
                  <td className="px-4 py-3 text-gray-600">{attempt.country?.iso2 || "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {attempt.currency} {(attempt.customer_charged_subunit / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{attempt.reference}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={attempt.status} />
                  </td>
                  <td className="px-4 py-3">
                    <form action={verifySubscriptionPayment}>
                      <input type="hidden" name="id" value={attempt.id} />
                      <SubmitButton variant="success" pendingText="Verifying…">
                        Verify with Pesapal
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
              {subData.attempts.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No pending Pesapal subscription payments.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <SimplePager
            meta={subData.attempts}
            basePath="/payment-verification"
            pageParam="sub_page"
            preserve={subPreserve}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Order payments</h2>

        <form className="flex flex-wrap gap-3" method="get">
          <select
            name="order_status"
            defaultValue={params.order_status ?? ""}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
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
                <th className="px-4 py-3 text-left font-medium text-gray-500">Country</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Reference</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orderData.attempts.data.map((attempt) => (
                <tr key={attempt.id}>
                  <td className="px-4 py-3 text-gray-600">
                    {attempt.user ? `${attempt.user.name} · ${attempt.user.email}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{attempt.country?.iso2 || "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {attempt.currency} {(attempt.customer_charged_subunit / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{attempt.reference}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={attempt.status} />
                  </td>
                  <td className="px-4 py-3">
                    <form action={verifyOrderPayment}>
                      <input type="hidden" name="id" value={attempt.id} />
                      <SubmitButton variant="success" pendingText="Verifying…">
                        Verify with Pesapal
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
              {orderData.attempts.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No pending Pesapal order payments.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <SimplePager
            meta={orderData.attempts}
            basePath="/payment-verification"
            pageParam="order_page"
            preserve={orderPreserve}
          />
        </div>
      </section>
    </div>
  );
}
