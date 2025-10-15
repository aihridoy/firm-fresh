"use client";

import { useState } from "react";

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Organic Tomatoes",
      farmer: "Green Valley Farm",
      price: 4.99,
      quantity: 2,
      unit: "kg",
      image: "🍅",
    },
    {
      id: 2,
      name: "Fresh Spinach",
      farmer: "Sunshine Organics",
      price: 3.49,
      quantity: 1,
      unit: "bunch",
      image: "🥬",
    },
    {
      id: 3,
      name: "Red Apples",
      farmer: "Orchard Hills",
      price: 5.99,
      quantity: 3,
      unit: "kg",
      image: "🍎",
    },
  ]);

  interface CartItem {
    id: number;
    name: string;
    farmer: string;
    price: number;
    quantity: number;
    unit: string;
    image: string;
  }

  const updateQuantity = (id: number, change: number) => {
    setCartItems((items: CartItem[]) =>
      items.map((item: CartItem) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items: CartItem[]) =>
      items.filter((item: CartItem) => item.id !== id)
    );
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = 2.99;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {cartItems.length} items in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <div className="bg-primary-100 dark:bg-primary-900 w-20 h-20 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                    {item.image}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <i className="fas fa-store mr-1"></i>
                      {item.farmer}
                    </p>
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      ${item.price.toFixed(2)} / {item.unit}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-3">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                      aria-label="Remove item"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg transition"
                      >
                        <i className="fas fa-minus text-sm"></i>
                      </button>
                      <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-lg transition"
                      >
                        <i className="fas fa-plus text-sm"></i>
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {cartItems.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                <i className="fas fa-shopping-cart text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Your cart is empty
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">
                    ${deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium">
                    Apply
                  </button>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 hover:from-primary-700 hover:to-primary-900 text-white py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg">
                Proceed to Checkout
              </button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <i className="fas fa-shield-alt text-primary-600 dark:text-primary-400"></i>
                  <span>Secure checkout guaranteed</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <i className="fas fa-truck text-primary-600 dark:text-primary-400"></i>
                  <span>Free delivery on orders over $50</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <i className="fas fa-leaf text-primary-600 dark:text-primary-400"></i>
                  <span>100% organic produce</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
