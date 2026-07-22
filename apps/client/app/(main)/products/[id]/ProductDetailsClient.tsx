"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useGetProductByIdQuery, useGetProductsQuery } from "@/lib/api/endpoints/products";
import { useGetProductReviewsQuery, useDeleteReviewMutation, Review } from "@/lib/api/endpoints/reviews";
import { useGetUserOrdersQuery } from "@/lib/api/endpoints/orders";
import { useAddToCartMutation } from "@/lib/api/endpoints/cart";
import { useToggleFavoriteMutation, useCheckFavoriteQuery } from "@/lib/api/endpoints/favorites";
import { useAppSelector } from "@/lib/hooks";
import { selectIsAuthenticated, selectCurrentUser } from "@/lib/api/endpoints/userSlice";
import ProductCard from "@/components/ProductCard";
import ReviewModal from "@/components/ReviewModal";
import { DetailSkeleton } from "@/components/Skeleton";

function StarRow({ rating, size = "" }: { rating: number; size?: string }) {
  return (
    <div className={`flex text-yellow-400 ${size}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={n <= Math.round(rating) ? "fas fa-star" : "far fa-star"}></i>
      ))}
    </div>
  );
}

export default function ProductDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  const { data, isLoading, isError } = useGetProductByIdQuery(id);
  const product = data?.data;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "farmer">("description");
  const [reviewPage, setReviewPage] = useState(1);
  const [allReviews, setAllReviews] = useState<Review[]>([]);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setActiveTab("description");
    setReviewPage(1);
    setAllReviews([]);
  }, [id]);

  const { data: reviewsData } = useGetProductReviewsQuery({ productId: id, page: reviewPage, limit: 5 });

  useEffect(() => {
    if (reviewsData?.data) {
      setAllReviews((prev) => (reviewPage === 1 ? reviewsData.data : [...prev, ...reviewsData.data]));
    }
  }, [reviewsData, reviewPage]);

  const { data: relatedData } = useGetProductsQuery(
    product ? { category: product.category, limit: 5 } : undefined,
    { skip: !product }
  );
  const relatedProducts = (relatedData?.data ?? []).filter((p) => p._id !== id).slice(0, 4);

  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [toggleFavorite] = useToggleFavoriteMutation();
  const { data: favoriteData } = useCheckFavoriteQuery(id, { skip: !isAuthenticated });
  const isFavorited = favoriteData?.favorited ?? false;
  const [deleteReview] = useDeleteReviewMutation();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const { data: deliveredOrdersData } = useGetUserOrdersQuery(
    { status: "delivered", limit: 100 },
    { skip: !isAuthenticated }
  );
  const deliverableOrder = deliveredOrdersData?.data.find((o) => o.items.some((i) => i.product === id));
  const myReview = allReviews.find((r) => typeof r.user === "object" && r.user._id === user?._id);
  const canWriteReview = isAuthenticated && !!deliverableOrder;

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="text-center py-24">
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Product not found.</p>
        <Link href="/products" className="text-primary-600 dark:text-primary-400 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const farmer = typeof product.farmer === "object" ? product.farmer : null;
  const outOfStock = product.stock <= 0;
  const avgRating = product.avgRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push("?auth=login");
      return true;
    }
    return false;
  };

  const handleAddToCart = async () => {
    if (requireAuth()) return;
    try {
      await addToCart({ productId: product._id, quantity }).unwrap();
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error("Couldn't add to cart. Please try again.");
    }
  };

  const handleBuyNow = () => {
    if (requireAuth()) return;
    router.push(`/payment-process?productId=${product._id}&quantity=${quantity}`);
  };

  const handleToggleFavorite = async () => {
    if (requireAuth()) return;
    try {
      const result = await toggleFavorite(product._id).unwrap();
      toast.success(result.favorited ? "Added to favorites" : "Removed from favorites");
    } catch {
      toast.error("Couldn't update favorites. Please try again.");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteReview({ id: reviewId, productId: id }).unwrap();
      toast.success("Review deleted");
    } catch {
      toast.error("Couldn't delete review.");
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-primary-600">
                Home
              </Link>
            </li>
            <li>
              <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
            </li>
            <li>
              <Link href="/products" className="text-gray-500 hover:text-primary-600">
                Products
              </Link>
            </li>
            <li>
              <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
            </li>
            <li className="text-gray-900 dark:text-white">{product.name}</li>
          </ol>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[selectedImage]?.url}
                alt={product.images[selectedImage]?.alt || product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, i) => (
                  <button
                    key={image.url + i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 ${
                      selectedImage === i ? "border-primary-500" : "border-transparent hover:border-primary-500"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {product.features.map((feature) => (
                  <span
                    key={feature}
                    className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium capitalize"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Produced by{" "}
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  {farmer ? `${farmer.firstName} ${farmer.lastName}` : "FarmFresh Farmer"}
                </span>
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <StarRow rating={avgRating} />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{avgRating.toFixed(1)}</span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">({reviewCount} reviews)</span>
              {canWriteReview && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                >
                  {myReview ? "Edit your review" : "Write a review"}
                </button>
              )}
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">৳{product.price}</span>
                  <span className="text-lg text-gray-500 dark:text-gray-400">/{product.unit}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Available Stock</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {product.stock} {product.unit}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <i className="fas fa-map-marker-alt mr-2"></i>
                <span>{product.farmLocation}</span>
              </div>
            </div>

            {!outOfStock && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity ({product.unit})
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <i className="fas fa-minus text-sm"></i>
                    </button>
                    <input
                      type="number"
                      readOnly
                      value={quantity}
                      className="w-20 text-center py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <i className="fas fa-plus text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleBuyNow}
                disabled={outOfStock}
                className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <i className="fas fa-bolt mr-2"></i>
                {outOfStock ? "Out of Stock" : "Buy Now"}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={outOfStock || isAdding}
                className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-medium transition"
              >
                <i className="fas fa-shopping-cart mr-2"></i>
                {isAdding ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={handleToggleFavorite}
                className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-medium transition"
              >
                <i className={`${isFavorited ? "fas text-red-500" : "far"} fa-heart mr-2`}></i>
                {isFavorited ? "Remove from Favorites" : "Add to Favorite"}
              </button>
            </div>

            {farmer && (
              <div className="bg-primary-50 dark:bg-primary-900 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  {farmer.profilePicture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={farmer.profilePicture} alt={farmer.firstName} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                      {farmer.firstName.charAt(0)}
                      {farmer.lastName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {farmer.firstName} {farmer.lastName}
                    </h4>
                    {farmer.createdAt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Farmer since {new Date(farmer.createdAt).getFullYear()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {(["description", "reviews", "farmer"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 py-4 px-1 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? "border-primary-500 text-primary-600 dark:text-primary-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {tab === "reviews" ? `Reviews (${reviewCount})` : tab === "farmer" ? "Farmer Info" : "Description"}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p>{product.description}</p>
                {product.harvestDate && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Harvested on {new Date(product.harvestDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {activeTab === "farmer" && (
              <div className="text-gray-700 dark:text-gray-300 space-y-2">
                <p>
                  <span className="font-medium">Name:</span> {farmer ? `${farmer.firstName} ${farmer.lastName}` : "N/A"}
                </p>
                {farmer?.farmerDetails?.farmName && (
                  <p>
                    <span className="font-medium">Farm:</span> {farmer.farmerDetails.farmName}
                  </p>
                )}
                {farmer?.farmerDetails?.specialization && (
                  <p className="capitalize">
                    <span className="font-medium">Specialization:</span> {farmer.farmerDetails.specialization}
                  </p>
                )}
                <p>
                  <span className="font-medium">Location:</span> {product.farmLocation}
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {allReviews.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">No reviews yet for this product.</p>
                )}
                {allReviews.map((review) => {
                  const reviewer = typeof review.user === "object" ? review.user : null;
                  return (
                    <div key={review._id} className="bg-white dark:bg-gray-800 rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        {reviewer?.profilePicture ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={reviewer.profilePicture}
                            alt={reviewer.firstName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold flex-shrink-0">
                            {reviewer?.firstName?.charAt(0) || "?"}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : "Anonymous"}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <StarRow rating={review.rating} size="text-sm" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {reviewer?._id === user?._id && (
                              <div className="flex items-center space-x-3 text-sm">
                                <button
                                  onClick={() => setReviewModalOpen(true)}
                                  className="text-primary-600 dark:text-primary-400 hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(review._id)}
                                  className="text-red-500 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {reviewsData?.pagination && reviewPage < reviewsData.pagination.totalPages && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setReviewPage((p) => p + 1)}
                      className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium transition"
                    >
                      Load More Reviews
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {reviewModalOpen && (
        <ReviewModal
          productId={product._id}
          orderId={deliverableOrder?._id ?? ""}
          productName={product.name}
          existingReview={myReview ? { _id: myReview._id, rating: myReview.rating, comment: myReview.comment } : undefined}
          onClose={() => setReviewModalOpen(false)}
        />
      )}
    </>
  );
}
