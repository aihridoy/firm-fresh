"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useGetProductByIdQuery } from "@/lib/api/endpoints/products";
import { useGetCartQuery } from "@/lib/api/endpoints/cart";
import { useCreateOrderMutation, PaymentMethod } from "@/lib/api/endpoints/orders";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser, selectIsAuthenticated } from "@/lib/api/endpoints/userSlice";

const DELIVERY_FEE = 50;
const SERVICE_FEE = 25;

export default function PaymentProcess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const initialQuantity = parseInt(searchParams.get("quantity") || "1", 10);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  const { data: productData } = useGetProductByIdQuery(productId as string, { skip: !productId });
  const { data: cartData } = useGetCartQuery(undefined, { skip: !!productId || !isAuthenticated });

  const [quantity, setQuantity] = useState(initialQuantity);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [draftAddress, setDraftAddress] = useState("");
  const [draftQuantity, setDraftQuantity] = useState(initialQuantity);

  useEffect(() => {
    if (user?.address) setDeliveryAddress(user.address);
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");

  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();

  const isBuyNow = Boolean(productId);
  const product = productData?.data;
  const cartItems = cartData?.data.items ?? [];

  const lineItems = isBuyNow && product
    ? [{ name: product.name, farmLocation: product.farmLocation, price: product.price, unit: product.unit, quantity, image: product.images[0]?.url }]
    : cartItems.map((item) => ({
        name: item.product.name,
        farmLocation: item.product.farmLocation,
        price: item.product.price,
        unit: item.product.unit,
        quantity: item.quantity,
        image: item.product.images[0]?.url,
      }));

  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = lineItems.length > 0 ? subtotal + DELIVERY_FEE + SERVICE_FEE : 0;

  const openEditModal = () => {
    setDraftAddress(deliveryAddress);
    setDraftQuantity(quantity);
    setShowEditModal(true);
  };

  const saveEditModal = () => {
    setDeliveryAddress(draftAddress);
    if (isBuyNow && product) {
      setQuantity(Math.min(Math.max(draftQuantity, 1), product.stock));
    }
    setShowEditModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!deliveryAddress.trim()) {
      setError("Delivery address is required.");
      return;
    }
    if (lineItems.length === 0) {
      setError("There's nothing to check out.");
      return;
    }
    if (paymentMethod === "card") {
      if (cardNumber.replace(/\s/g, "").length < 12) {
        setError("Please enter a valid card number.");
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        setError("Expiry date must be in MM/YY format.");
        return;
      }
      if (cvv.length < 3) {
        setError("Please enter a valid CVV.");
        return;
      }
    } else if (mobileNumber.trim().length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }

    const paymentDetails =
      paymentMethod === "card"
        ? { cardLast4: cardNumber.replace(/\s/g, "").slice(-4) }
        : { transactionId: `TXN-${Date.now()}` };

    try {
      const result = await createOrder({
        deliveryAddress,
        paymentMethod,
        paymentDetails,
        items: isBuyNow && product ? [{ productId: product._id, quantity }] : undefined,
      }).unwrap();
      toast.success("Payment successful!");
      router.push(`/success?orderId=${result.data._id}`);
    } catch (err) {
      const message = (err as { data?: { error?: string } })?.data?.error || "Payment failed. Please try again.";
      setError(message);
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
            <li className="text-gray-900 dark:text-white">Payment</li>
          </ol>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {lineItems.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Nothing to check out yet.</p>
            <Link href="/products" className="text-primary-600 dark:text-primary-400 hover:underline">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {lineItems.map((item, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.farmLocation}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ৳{item.price}/{item.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Address:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right max-w-[60%]">
                    {deliveryAddress || "Not set"}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Fee:</span>
                  <span className="text-gray-900 dark:text-white">৳{DELIVERY_FEE.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Service Fee:</span>
                  <span className="text-gray-900 dark:text-white">৳{SERVICE_FEE.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span>Total:</span>
                  <span>৳{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={openEditModal}
                className="w-full mt-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 rounded-lg font-medium transition"
              >
                <i className="fas fa-edit mr-2"></i>Edit Order Details
              </button>
            </div>

            {/* Payment Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Payment Information</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-4 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: "card", icon: "fa-credit-card", label: "Credit/Debit Card" },
                      { value: "bkash", icon: "fa-mobile-alt", label: "bKash" },
                      { value: "nagad", icon: "fa-wallet", label: "Nagad" },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={() => setPaymentMethod(method.value as PaymentMethod)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <div className="ml-3 flex items-center">
                          <i className={`fas ${method.icon} text-lg mr-2`}></i>
                          <span className="font-medium">{method.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod !== "card" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="+880 1234 567890"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPlacingOrder}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium text-lg transition duration-200"
                >
                  <i className="fas fa-lock mr-2"></i>
                  {isPlacingOrder ? "Processing..." : `Complete Payment - ৳${total.toFixed(2)}`}
                </button>

                <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  <i className="fas fa-shield-alt mr-2"></i>
                  Simulated payment - no real charge will be made
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Edit Order Details Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Order Details</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Address
                </label>
                <textarea
                  rows={3}
                  value={draftAddress}
                  onChange={(e) => setDraftAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {isBuyNow && product && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity ({product.unit})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={product.stock}
                    value={draftQuantity}
                    onChange={(e) => setDraftQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveEditModal}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
