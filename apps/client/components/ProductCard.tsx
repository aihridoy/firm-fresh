"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/api/endpoints/products";
import { useAddToCartMutation } from "@/lib/api/endpoints/cart";
import { useToggleFavoriteMutation, useCheckFavoriteQuery } from "@/lib/api/endpoints/favorites";
import { useAppSelector } from "@/lib/hooks";
import { selectIsAuthenticated } from "@/lib/api/endpoints/userSlice";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [toggleFavorite] = useToggleFavoriteMutation();
  const { data: favoriteData } = useCheckFavoriteQuery(product._id, { skip: !isAuthenticated });

  const farmer = typeof product.farmer === "object" ? product.farmer : null;
  const isOrganic = product.features?.includes("organic");
  const isFavorited = favoriteData?.favorited ?? false;
  const outOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    await addToCart({ productId: product._id, quantity: 1 });
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    await toggleFavorite(product._id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <Link href={`/products/${product._id}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]?.url}
            alt={product.images[0]?.alt || product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {isOrganic && (
          <div className="absolute top-3 left-3">
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">Organic</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <button
            onClick={handleToggleFavorite}
            className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            aria-label="Toggle favorite"
          >
            <i className={`${isFavorited ? "fas text-red-500" : "far text-gray-600 dark:text-gray-400"} fa-heart`}></i>
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Link href={`/products/${product._id}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition">
              {product.name}
            </h3>
          </Link>
          {typeof product.avgRating === "number" && (
            <div className="flex items-center text-yellow-400">
              <i className="fas fa-star text-sm"></i>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{product.avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          By {farmer ? `${farmer.firstName} ${farmer.lastName}` : "FarmFresh Farmer"} • {product.farmLocation}
        </p>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">৳{product.price}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">/{product.unit}</span>
          </div>
          <span className={`text-sm ${outOfStock ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
            {outOfStock ? "Out of stock" : `Stock: ${product.stock}${product.unit === "kg" ? "kg" : ""}`}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock || isAdding}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition"
        >
          {outOfStock ? "Out of Stock" : isAdding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
