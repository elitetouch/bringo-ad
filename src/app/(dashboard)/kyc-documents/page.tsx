import { apiGet } from "@/lib/api";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { approveKycDocument, rejectKycDocument } from "@/lib/actions/resources";

type KycRow = {
  id: string;
  type: string;
  status: string;
  url: string;
  rejection_reason: string | null;
  merchant: { business_name: string | null; business_email: string | null } | null;
};

type KycResponse = {
  documents: {
    data: KycRow[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
};

export default async function KycDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  query.set("status", params.status ?? "pending");

  const { data } = await apiGet<KycResponse>(`/admin/kyc-documents?${query.toString()}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">KYC Documents</h1>
        <p className="text-sm text-gray-500">Review merchant verification documents.</p>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <select
          name="status"
          defaultValue={params.status ?? "pending"}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
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
              <th className="px-4 py-3 text-left font-medium text-gray-500">Merchant</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Document</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.documents.data.map((doc) => (
              <tr key={doc.id}>
                <td className="px-4 py-3 text-gray-600">
                  {doc.merchant?.business_name || doc.merchant?.business_email || "—"}
                </td>
                <td className="px-4 py-3 capitalize text-gray-600">{doc.type.replaceAll("_", " ")}</td>
                <td className="px-4 py-3">
                  <a href={doc.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                    View file
                  </a>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={doc.status} />
                  {doc.rejection_reason && (
                    <p className="mt-1 text-xs text-danger-600">{doc.rejection_reason}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {doc.status !== "approved" && (
                      <form action={approveKycDocument}>
                        <input type="hidden" name="id" value={doc.id} />
                        <SubmitButton variant="success">Approve</SubmitButton>
                      </form>
                    )}
                    {doc.status !== "rejected" && (
                      <form action={rejectKycDocument} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={doc.id} />
                        <input
                          type="text"
                          name="reason"
                          placeholder="Reason"
                          required
                          className="w-32 rounded-md border border-gray-300 px-2 py-1 text-xs"
                        />
                        <SubmitButton variant="danger">Reject</SubmitButton>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {data.documents.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination meta={data.documents} basePath="/kyc-documents" />
      </div>
    </div>
  );
}
