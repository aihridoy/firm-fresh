"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGetPublicStatsQuery } from "@/lib/api/endpoints/stats";

const CATEGORIES = ["vegetables", "fruits", "grains", "dairy", "herbs", "honey"];
const POPULAR = ["Tomatoes", "Mangoes", "Honey", "Fresh Milk"];

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const { data: statsData } = useGetPublicStatsQuery();
  const stats = statsData?.data;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (category) params.set("category", category);
    router.push(`/products${params.size ? `?${params}` : ""}`);
  };

  return (
    <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 text-white">
      <div className="absolute inset-0 bg-black opacity-20 dark:opacity-40"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Fresh from Farm to Your Table
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-green-100 dark:text-green-200 max-w-3xl mx-auto">
            Connect directly with local farmers and get the freshest produce
            delivered to your doorstep
          </p>

          {/* Search Bar — broad catalog explorer (navbar search jumps to a single product) */}
          <div className="max-w-2xl mx-auto mb-8">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row rounded-lg overflow-hidden shadow-lg dark:shadow-2xl"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for vegetables, fruits, honey..."
                className="flex-1 min-w-0 px-6 py-4 bg-white text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:placeholder-gray-400 text-lg focus:outline-none"
              />
              <div className="flex border-t sm:border-t-0 border-gray-300 dark:border-gray-600">
                <div className="relative flex-1 sm:flex-none min-w-0">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    aria-label="Category"
                    className="w-full appearance-none pl-4 pr-10 py-4 bg-white text-gray-900 dark:text-gray-100 dark:bg-gray-800 sm:border-l border-gray-300 dark:border-gray-600 focus:outline-none capitalize"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">
                        {c}
                      </option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400 pointer-events-none"></i>
                </div>
                <button
                  type="submit"
                  aria-label="Search"
                  className="bg-primary-700 hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-700 px-8 py-4 transition"
                >
                  <i className="fas fa-search text-xl"></i>
                </button>
              </div>
            </form>

            {/* Popular searches */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-green-100 dark:text-green-200">Popular:</span>
              {POPULAR.map((term) => (
                <Link
                  key={term}
                  href={`/products?search=${encodeURIComponent(term)}`}
                  className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>

          {/* Stats — live platform counts */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-xl mx-auto">
            {[
              { value: stats?.farmers, label: "Local Farmers" },
              { value: stats?.products, label: "Fresh Products" },
              { value: stats?.customers, label: "Happy Customers" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold">{stat.value ?? "—"}</div>
                <div className="text-green-200 dark:text-green-300 sm:whitespace-nowrap">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
