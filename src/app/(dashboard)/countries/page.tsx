import { apiGet } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { createCountry } from "@/lib/actions/resources";

type Country = {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  currency_code: string;
  currency_symbol: string | null;
  dial_code: string | null;
  is_active: boolean;
};

export default async function CountriesPage() {
  const { data } = await apiGet<{ countries: Country[] }>("/admin/countries");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Countries</h1>
        <p className="text-sm text-gray-500">Markets Bringo Direct operates in.</p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Add country</h2>
        <form action={createCountry} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
            <input name="name" required className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Nigeria" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">ISO2</label>
            <input name="iso2" required maxLength={2} className="w-16 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase" placeholder="NG" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">ISO3</label>
            <input name="iso3" required maxLength={3} className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase" placeholder="NGA" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Currency code</label>
            <input name="currency_code" required maxLength={8} className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase" placeholder="NGN" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Symbol</label>
            <input name="currency_symbol" className="w-16 rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="₦" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Dial code</label>
            <input name="dial_code" className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="+234" />
          </div>
          <SubmitButton variant="primary" pendingText="Adding…">Add country</SubmitButton>
        </form>
      </section>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Country</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">ISO</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Currency</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Dial code</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.countries.map((country) => (
              <tr key={country.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{country.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {country.iso2} / {country.iso3}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {country.currency_code} {country.currency_symbol}
                </td>
                <td className="px-4 py-3 text-gray-600">{country.dial_code || "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={country.is_active ? "active" : "suspended"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
