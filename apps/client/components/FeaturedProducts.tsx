"use client";

import Link from "next/link";
import { useGetFeaturedProductsQuery } from "@/lib/api/endpoints/products";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeleton";

export default function FeaturedProducts() {
  const { data, isLoading, isError } = useGetFeaturedProductsQuery();
  const products = data?.data ?? [];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Featured Products</h2>
            <p className="text-gray-600 dark:text-gray-400">Fresh picks from our local farmers</p>
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
          <p className="text-center text-red-500 py-12">Couldn&apos;t load featured products. Please try again later.</p>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">No products available yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
