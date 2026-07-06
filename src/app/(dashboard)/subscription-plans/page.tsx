import { apiGet } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { createSubscriptionPlan, createSubscriptionPlanPrice } from "@/lib/actions/resources";

type Price = {
  id: string;
  interval: string;
  currency: string;
  amount: number;
  is_active: boolean;
  country: { name: string; iso2: string } | null;
};

type Plan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  prices: Price[];
};

type Country = { id: string; name: string; iso2: string };

export default async function SubscriptionPlansPage() {
  const [plansRes, countriesRes] = await Promise.all([
    apiGet<{ plans: Plan[] }>("/admin/subscription-plans"),
    apiGet<{ countries: Country[] }>("/admin/countries"),
  ]);

  const plans = plansRes.data.plans;
  const countries = countriesRes.data.countries;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Subscription Plans</h1>
        <p className="text-sm text-gray-500">Create plans and per-country pricing.</p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">New plan</h2>
        <form action={createSubscriptionPlan} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Code</label>
            <input name="code" required className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="gold" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
            <input name="name" required className="w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Gold Plan" />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
            <input name="description" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <SubmitButton variant="primary" pendingText="Creating…">Create plan</SubmitButton>
        </form>
      </section>

      <div className="space-y-6">
        {plans.map((plan) => (
          <section key={plan.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {plan.name} <span className="text-xs text-gray-400">({plan.code})</span>
                </h3>
                {plan.description && <p className="text-sm text-gray-500">{plan.description}</p>}
              </div>
              <StatusBadge status={plan.is_active ? "active" : "suspended"} />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Country</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Interval</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Amount</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plan.prices.map((price) => (
                    <tr key={price.id}>
                      <td className="px-4 py-2 text-gray-600">{price.country?.iso2 || "—"}</td>
                      <td className="px-4 py-2 capitalize text-gray-600">{price.interval}</td>
                      <td className="px-4 py-2 font-medium text-gray-900">
                        {price.currency} {(price.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <StatusBadge status={price.is_active ? "active" : "suspended"} />
                      </td>
                    </tr>
                  ))}
                  {plan.prices.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                        No prices yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <form action={createSubscriptionPlanPrice} className="flex flex-wrap items-end gap-3 border-t border-gray-100 px-5 py-4">
              <input type="hidden" name="plan_id" value={plan.id} />
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Country</label>
                <select name="country_id" required className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.iso2} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Interval</label>
                <select name="interval" required className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Currency</label>
                <input name="currency" required maxLength={8} className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="NGN" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Amount (subunit)</label>
                <input name="amount" type="number" min={1} required className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="500000" />
              </div>
              <SubmitButton variant="neutral" pendingText="Adding…">Add price</SubmitButton>
            </form>
          </section>
        ))}

        {plans.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
            No subscription plans yet — create one above.
          </p>
        )}
      </div>
    </div>
  );
}
