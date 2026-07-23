"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useGetAdminOrderQuery, useUpdateAdminOrderStatusMutation } from "@/lib/api/endpoints/admin";
import { OrderStatus } from "@/lib/api/endpoints/orders";
import { ListSkeleton } from "@/components/Skeleton";
import AdminSelect from "../../AdminSelect";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "canceled"];

const STATUS_CLASSES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  canceled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function AdminOrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useGetAdminOrderQuery(id);
  const [updateStatus] = useUpdateAdminOrderStatusMutation();

  const order = data?.data;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    try {
      await updateStatus({ id: order._id, status: newStatus }).unwrap();
      toast.success(`Order ${order.orderNumber} marked ${newStatus}`);
    } catch (err) {
      toast.error((err as { data?: { error?: string } })?.data?.error ?? "Update failed");
    }
  };

  if (isLoading) return <ListSkeleton rows={4} />;
  if (!order) return <p className="text-center text-gray-500 dark:text-gray-400 py-12">Order not found.</p>;

  const customer = typeof order.user === "object" ? order.user : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
            aria-label="Back to orders"
          >
            <i className="fas fa-arrow-left"></i>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{order.orderNumber}</h1>
          <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${STATUS_CLASSES[order.status]}`}>
            {order.status}
          </span>
        </div>
        <AdminSelect
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          aria-label="Update order status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </AdminSelect>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={`${item.product}-${item.productName}`}
                className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3"
              >
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{item.productName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ৳{item.price}/{item.unit} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                  ৳{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>৳{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Delivery Fee</span>
              <span>৳{order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Service Fee</span>
              <span>৳{order.serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-1">
              <span>Total</span>
              <span>৳{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer + delivery + payment */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Customer</h2>
            <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-900 dark:text-white">
                {customer ? `${customer.firstName} ${customer.lastName}` : "—"}
              </p>
              {customer?.email && <p>{customer.email}</p>}
              {customer?.phone && <p>{customer.phone}</p>}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Delivery</h2>
            <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <p>{order.deliveryAddress}</p>
              {order.deliveryDate && <p>Requested: {new Date(order.deliveryDate).toLocaleDateString()}</p>}
              <p>Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Payment</h2>
            <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <p className="capitalize">Method: {order.paymentMethod}</p>
              {order.paymentDetails?.transactionId && <p>Txn: {order.paymentDetails.transactionId}</p>}
              {order.paymentDetails?.cardLast4 && <p>Card: •••• {order.paymentDetails.cardLast4}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
