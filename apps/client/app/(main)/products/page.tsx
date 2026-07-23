"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetProductsQuery, GetProductsParams } from "@/lib/api/endpoints/products";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const CATEGORIES = ["vegetables", "fruits", "grains", "dairy", "herbs", "honey"];
const PRICE_RANGES: Record<string, { minPrice?: number; maxPrice?: number }> = {
  "under-30": { maxPrice: 30 },
  "30-50": { minPrice: 30, maxPrice: 50 },
  "50-100": { minPrice: 50, maxPrice: 100 },
  "over-100": { minPrice: 100 },
};
const LOCATIONS = ["Dhaka", "Chattogram", "Sylhet", "Rangpur", "Khulna", "Rajshahi", "Bogura", "Jessore", "Comilla", "Pabna"];

export default function Products() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [priceKey, setPriceKey] = useState(searchParams.get("priceKey") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [organicOnly, setOrganicOnly] = useState(searchParams.get("organic") === "true");

  // Resync draft filters whenever the URL changes from elsewhere (navbar search, category links, pagination)
  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
    setPriceKey(searchParams.get("priceKey") || "");
    setLocation(searchParams.get("location") || "");
    setOrganicOnly(searchParams.get("organic") === "true");
  }, [searchParams]);

  const sort = (searchParams.get("sort") as GetProductsParams["sort"]) || "featured";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const farmer = searchParams.get("farmer") || undefined;

  const queryParams: GetProductsParams = {
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    sort,
    page,
    limit: 12,
    farmer,
    location: searchParams.get("location") || undefined,
    organic: searchParams.get("organic") === "true" || undefined,
    ...PRICE_RANGES[searchParams.get("priceKey") || ""],
  };

  const { data, isLoading, isFetching, isError } = useGetProductsQuery(queryParams);
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const pushParams = (updates: Record<string, string | undefined>, replace = false) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const url = `/products?${params.toString()}`;
    if (replace) router.replace(url, { scroll: false });
    else router.push(url);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams({ search: searchInput || undefined, page: undefined });
  };

  // Live search: apply the query as the user types, debounced
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  useEffect(() => {
    if (debouncedSearch.trim() === (searchParams.get("search") || "")) return;
    pushParams({ search: debouncedSearch.trim() || undefined, page: undefined }, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const applyFilters = () => {
    pushParams({
      category: category || undefined,
      priceKey: priceKey || undefined,
      location: location || undefined,
      organic: organicOnly ? "true" : undefined,
      page: undefined,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    pushParams({ sort: e.target.value, page: undefined });
  };

  const goToPage = (p: number) => {
    pushParams({ page: p > 1 ? String(p) : undefined });
  };

  const rangeStart = pagination ? (pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1) : 0;
  const rangeEnd = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <>
      {/* Page Header */}
      <div className="bg-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Fresh Products</h1>
          <p className="text-xl text-primary-100">Discover fresh, locally-sourced produce from our trusted farmers</p>
          <form onSubmit={handleSearchSubmit} className="mt-6 max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button type="submit" aria-label="Search">
                <i className="fas fa-search absolute left-3 top-4 text-gray-400"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filters and Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Category</h4>
                <div className="space-y-2">
                  {CATEGORIES.map((c) => (
                    <label key={c} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={category === c}
                        onChange={() => setCategory(category === c ? "" : c)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Price Range</h4>
                <div className="space-y-2">
                  {[
                    { key: "under-30", label: "Under ৳30" },
                    { key: "30-50", label: "৳30 - ৳50" },
                    { key: "50-100", label: "৳50 - ৳100" },
                    { key: "over-100", label: "Over ৳100" },
                  ].map((range) => (
                    <label key={range.key} className="flex items-center">
                      <input
                        type="radio"
                        name="price"
                        checked={priceKey === range.key}
                        onChange={() => setPriceKey(priceKey === range.key ? "" : range.key)}
                        className="border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Location</h4>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Locations</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Organic Filter */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={organicOnly}
                    onChange={(e) => setOrganicOnly(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Organic Only</span>
                </label>
              </div>

              <button
                onClick={applyFilters}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {pagination ? `Showing ${rangeStart}-${rangeEnd} of ${pagination.total} products` : ""}
              </p>
              <select
                value={sort}
                onChange={handleSortChange}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {isLoading && (
              <ProductGridSkeleton count={9} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" />
            )}
            {isError && <p className="text-center text-red-500 py-12">Couldn&apos;t load products. Please try again.</p>}
            {!isLoading && !isError && products.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-12">No products match your filters.</p>
            )}

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${
                isFetching && !isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav aria-label="Pagination">
                  <ul className="inline-flex items-center -space-x-px text-gray-600 dark:text-gray-300">
                    <li>
                      <button
                        onClick={() => goToPage(Math.max(page - 1, 1))}
                        disabled={page <= 1}
                        className="block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                      <li key={p}>
                        <button
                          onClick={() => goToPage(p)}
                          className={`px-3 py-2 leading-tight border ${
                            p === page
                              ? "text-white bg-primary-600 border-primary-600 hover:bg-primary-700"
                              : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={() => goToPage(Math.min(page + 1, pagination.totalPages))}
                        disabled={page >= pagination.totalPages}
                        className="block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
