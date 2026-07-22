"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGetProductsQuery } from "@/lib/api/endpoints/products";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Skeleton } from "@/components/Skeleton";

const MIN_CHARS = 2;

export default function NavbarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLFormElement>(null);

  const debounced = useDebouncedValue(query.trim(), 300);
  const active = debounced.length >= MIN_CHARS;
  const { data, isFetching } = useGetProductsQuery(
    { search: debounced, limit: 6 },
    { skip: !active }
  );
  const results = active ? (data?.data ?? []) : [];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeAndClear = () => {
    setOpen(false);
    setQuery("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      closeAndClear();
    }
  };

  return (
    <form ref={containerRef} onSubmit={handleSubmit} className="hidden lg:block relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        placeholder="Search products..."
        className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
      />
      <button type="submit" aria-label="Search" className="absolute left-3 top-2.5">
        <i className="fas fa-search text-gray-400"></i>
      </button>

      {/* Typeahead dropdown */}
      {open && active && (
        <div className="absolute top-full mt-2 w-80 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {isFetching && results.length === 0 && (
            <div className="p-3 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isFetching && results.length === 0 && (
            <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              No products found for &ldquo;{debounced}&rdquo;
            </p>
          )}

          {results.map((product) => (
            <Link
              key={product._id}
              href={`/products/${product._id}`}
              onClick={closeAndClear}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[0]?.url}
                alt={product.name}
                className="h-10 w-10 rounded-lg object-cover flex-shrink-0 bg-gray-100 dark:bg-gray-700"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{product.category}</p>
              </div>
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 whitespace-nowrap">
                ৳{product.price}/{product.unit}
              </span>
            </Link>
          ))}

          {results.length > 0 && (
            <button
              type="submit"
              className="w-full px-3 py-2.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700 transition"
            >
              See all results for &ldquo;{debounced}&rdquo;
            </button>
          )}
        </div>
      )}
    </form>
  );
}
