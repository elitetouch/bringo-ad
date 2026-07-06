import Link from "next/link";

type LaravelPagination = {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
};

export function Pagination({ meta, basePath }: { meta: LaravelPagination; basePath: string }) {
  if (meta.last_page <= 1) return null;

  const hasPrev = meta.current_page > 1;
  const hasNext = meta.current_page < meta.last_page;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
      <span>
        Page {meta.current_page} of {meta.last_page} · {meta.total} total
      </span>
      <div className="flex gap-2">
        <Link
          href={`${basePath}?page=${meta.current_page - 1}`}
          aria-disabled={!hasPrev}
          className={`rounded-md border px-3 py-1.5 ${
            hasPrev ? "border-gray-300 hover:bg-gray-50" : "pointer-events-none border-gray-200 text-gray-300"
          }`}
        >
          Previous
        </Link>
        <Link
          href={`${basePath}?page=${meta.current_page + 1}`}
          aria-disabled={!hasNext}
          className={`rounded-md border px-3 py-1.5 ${
            hasNext ? "border-gray-300 hover:bg-gray-50" : "pointer-events-none border-gray-200 text-gray-300"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
