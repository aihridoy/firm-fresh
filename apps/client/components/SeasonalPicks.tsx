"use client";

import Link from "next/link";
import { useGetProductsQuery } from "@/lib/api/endpoints/products";
import { ProductGridSkeleton } from "@/components/Skeleton";

export default function SeasonalPicks() {
  const { data, isLoading, isError } = useGetProductsQuery({ sort: "newest", limit: 4 });
  const products = data?.data ?? [];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Seasonal Picks</h2>
            <p className="text-gray-600 dark:text-gray-400">The freshest arrivals of the season</p>
          </div>
          <Link
            href="/products"
            className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300"
          >
            View All <i className="fas fa-arrow-right ml-1"></i>
          </Link>
        </div>

        {isLoading && <ProductGridSkeleton count={4} />}

        {isError && (
          <p className="text-center text-red-500 py-12">Couldn&apos;t load seasonal picks. Please try again later.</p>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">No products available yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const farmer = typeof product.farmer === "object" ? product.farmer : null;
            return (
              <Link
                key={product._id}
                href={`/products/${product._id}`}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]?.url}
                    alt={product.images[0]?.alt || product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Seasonal
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition mb-2">
                    {product.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">৳{product.price}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">/{product.unit}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    By {farmer ? `${farmer.firstName} ${farmer.lastName}` : "FarmFresh Farmer"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
