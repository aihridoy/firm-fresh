"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGetOrderByIdQuery } from "@/lib/api/endpoints/orders";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/api/endpoints/userSlice";
import { generateInvoicePdf } from "@/lib/generateInvoicePdf";
import { PanelSkeleton } from "@/components/Skeleton";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const user = useAppSelector(selectCurrentUser);

  const { data, isLoading, isError } = useGetOrderByIdQuery(orderId as string, { skip: !orderId });
  const order = data?.data;

  if (!orderId || isError) {
    return (
      <div className="text-center py-24">
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Order not found.</p>
        <Link href="/products" className="text-primary-600 dark:text-primary-400 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (isLoading || !order) {
    return <PanelSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Success Icon and Message */}
      <div className="text-center mb-12">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900 mb-6">
          <i className="fas fa-check text-4xl text-green-600 dark:text-green-400"></i>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Payment Successful!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">Thank you for your order</p>
        <p className="text-gray-500 dark:text-gray-500">Order #{order.orderNumber}</p>
      </div>

      {/* Email Confirmation Notice */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-center">
          <i className="fas fa-envelope text-blue-600 dark:text-blue-400 mr-3"></i>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">Email Confirmation Sent</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              We&apos;ve sent your order confirmation to your email address.
            </p>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Details</h2>

          <div className="space-y-4 mb-6">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.productImage} alt={item.productName} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.productName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quantity: {item.quantity} {item.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Delivery Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Address:</span>
                <span className="text-gray-900 dark:text-white text-right">{order.deliveryAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="text-gray-900 dark:text-white capitalize">{order.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Payment Summary</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="text-gray-900 dark:text-white">৳{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Delivery Fee:</span>
              <span className="text-gray-900 dark:text-white">৳{order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Service Fee:</span>
              <span className="text-gray-900 dark:text-white">৳{order.serviceFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total Paid:</span>
                <span>৳{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Method</h3>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <i className="fas fa-credit-card text-lg text-gray-600 dark:text-gray-400"></i>
              <div>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {order.paymentMethod}
                  {order.paymentDetails?.cardLast4 ? ` ending in ${order.paymentDetails.cardLast4}` : ""}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Paid on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {order.paymentDetails?.transactionId && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
              <p className="font-mono text-sm text-gray-900 dark:text-white">{order.paymentDetails.transactionId}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={() => generateInvoicePdf(order, user ? `${user.firstName} ${user.lastName}` : "Customer")}
          className="flex items-center justify-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition"
        >
          <i className="fas fa-download mr-2"></i>
          Download Receipt (PDF)
        </button>
        <Link
          href="/bookings"
          className="flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition"
        >
          <i className="fas fa-list mr-2"></i>
          View All Orders
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center px-8 py-3 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition"
        >
          <i className="fas fa-home mr-2"></i>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
