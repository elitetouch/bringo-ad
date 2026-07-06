const STYLES: Record<string, string> = {
  active: "bg-success-50 text-success-600",
  approved: "bg-success-50 text-success-600",
  paid: "bg-success-50 text-success-600",
  fulfilled: "bg-success-50 text-success-600",
  pending: "bg-warning-50 text-warning-600",
  pending_payment: "bg-warning-50 text-warning-600",
  processing: "bg-warning-50 text-warning-600",
  scheduled: "bg-warning-50 text-warning-600",
  draft: "bg-gray-100 text-gray-600",
  suspended: "bg-danger-50 text-danger-600",
  rejected: "bg-danger-50 text-danger-600",
  canceled: "bg-danger-50 text-danger-600",
  expired: "bg-danger-50 text-danger-600",
  payment_failed: "bg-danger-50 text-danger-600",
  deleted: "bg-danger-50 text-danger-600",
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="text-gray-400">—</span>;

  const style = STYLES[status] ?? "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
