"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation } from "@/lib/api/endpoints/cart";
import { useAppSelector } from "@/lib/hooks";
import { selectIsAuthenticated } from "@/lib/api/endpoints/userSlice";
import { ListSkeleton } from "@/components/Skeleton";

export default function Cart() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data, isLoading } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();

  const items = data?.data.items ?? [];

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateCartItem({ itemId, quantity }).unwrap();
    } catch {
      toast.error("Couldn't update quantity. Please try again.");
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeFromCart(itemId).unwrap();
      toast.success("Item removed from cart");
    } catch {
      toast.error("Couldn't remove item. Please try again.");
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? 50 : 0;
  const serviceFee = items.length > 0 ? 25 : 0;
  const total = subtotal + deliveryFee + serviceFee;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-24 text-center">
        <i className="fas fa-shopping-cart text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Log in to view your cart</p>
        <Link href="?auth=login" className="text-primary-600 dark:text-primary-400 hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Shopping Cart</h1>
          <p className="text-gray-600 dark:text-gray-400">{items.length} item(s) in your cart</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ListSkeleton rows={3} />
            </div>
            <ListSkeleton rows={1} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.images[0]?.url}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product._id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 hover:text-primary-600 dark:hover:text-primary-400">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {item.product.farmLocation}
                      </p>
                      <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        ৳{item.product.price} / {item.product.unit}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                        aria-label="Remove item"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg transition"
                        >
                          <i className="fas fa-minus text-sm"></i>
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item._id, Math.min(item.product.stock, item.quantity + 1))}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-lg transition"
                        >
                          <i className="fas fa-plus text-sm"></i>
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        ৳{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                  <i className="fas fa-shopping-cart text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Your cart is empty</p>
                  <Link href="/products" className="text-primary-600 dark:text-primary-400 hover:underline">
                    Browse Products
                  </Link>
                </div>
              )}
            </div>

            {/* Order Summary */}
            {items.length > 0 && (
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Subtotal</span>
                      <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Delivery Fee</span>
                      <span className="font-semibold">৳{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Service Fee</span>
                      <span className="font-semibold">৳{serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span className="text-primary-600 dark:text-primary-400">৳{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Link
                    href="/payment-process"
                    className="block text-center w-full bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 hover:from-primary-700 hover:to-primary-900 text-white py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
                  >
                    Proceed to Checkout
                  </Link>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <i className="fas fa-shield-alt text-primary-600 dark:text-primary-400"></i>
                      <span>Secure checkout guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <i className="fas fa-truck text-primary-600 dark:text-primary-400"></i>
                      <span>Fast delivery across Bangladesh</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <i className="fas fa-leaf text-primary-600 dark:text-primary-400"></i>
                      <span>Fresh, farm-direct produce</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
