"use client";

import Link from "next/link";
import { useGetFavoritesQuery } from "@/lib/api/endpoints/favorites";
import { useAppSelector } from "@/lib/hooks";
import { selectIsAuthenticated } from "@/lib/api/endpoints/userSlice";
import ProductCard from "@/components/ProductCard";

export default function FavoritesPage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data, isLoading } = useGetFavoritesQuery(undefined, { skip: !isAuthenticated });
  const favorites = data?.data ?? [];

  if (!isAuthenticated) {
    return (
      <div className="text-center py-24">
        <i className="far fa-heart text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Log in to see your favorites</p>
        <Link href="?auth=login" className="text-primary-600 dark:text-primary-400 hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Favorites</h1>
        <p className="text-gray-600 dark:text-gray-400">Products you&apos;ve saved for later</p>
      </div>

      {isLoading && <p className="text-center text-gray-500 dark:text-gray-400 py-12">Loading favorites...</p>}

      {!isLoading && favorites.length === 0 && (
        <div className="text-center py-24">
          <i className="far fa-heart text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">No favorites yet</p>
          <Link href="/products" className="text-primary-600 dark:text-primary-400 hover:underline">
            Browse Products
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {favorites.map((favorite) => (
          <ProductCard key={favorite._id} product={favorite.product} />
        ))}
      </div>
    </div>
  );
}
