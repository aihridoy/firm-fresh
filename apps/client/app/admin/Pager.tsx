"use client";

import { Pagination } from "@/lib/api/endpoints/products";

export default function Pager({ pagination, onPage }: { pagination?: Pagination; onPage: (p: number) => void }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;
  return (
    <div className="flex items-center justify-end gap-2 mt-4 text-sm">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        Prev
      </button>
      <span className="text-gray-600 dark:text-gray-400">
        Page {page} of {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        Next
      </button>
    </div>
  );
}
