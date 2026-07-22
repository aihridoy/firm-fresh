"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser, selectIsAuthenticated } from "@/lib/api/endpoints/userSlice";
import { ListSkeleton } from "@/components/Skeleton";
import {
  useGetUserOrdersQuery,
  useGetFarmerOrdersQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  Order,
  OrderStatus,
} from "@/lib/api/endpoints/orders";
import { useGetUserReviewsQuery } from "@/lib/api/endpoints/reviews";
import { useAddToCartMutation } from "@/lib/api/endpoints/cart";
import { generateInvoicePdf } from "@/lib/generateInvoicePdf";
import ReviewModal from "@/components/ReviewModal";

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Order Placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

const STATUS_BADGES: Record<OrderStatus, { classes: string; icon: string }> = {
  pending: { classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: "fa-clock" },
  confirmed: { classes: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: "fa-check" },
  shipped: { classes: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", icon: "fa-truck" },
  delivered: { classes: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: "fa-check-circle" },
  canceled: { classes: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: "fa-times-circle" },
};

export default function Bookings() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const isFarmer = user?.userType === "farmer";

  useEffect(() => {
    if (!isAuthenticated) router.replace("/?auth=login");
  }, [isAuthenticated, router]);

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);
  const [reviewTarget, setReviewTarget] = useState<{
    productId: string;
    orderId: string;
    productName: string;
    existingReview?: { _id: string; rating: number; comment: string };
  } | null>(null);

  const queryArgs = { page, status: statusFilter || undefined };
  const userOrders = useGetUserOrdersQuery(queryArgs, { skip: isFarmer || !isAuthenticated });
  const farmerOrders = useGetFarmerOrdersQuery(queryArgs, { skip: !isFarmer || !isAuthenticated });
  const { data, isLoading } = isFarmer ? farmerOrders : userOrders;

  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  const { data: reviewsData } = useGetUserReviewsQuery(user?._id as string, { skip: !user || isFarmer });
  const reviewedByProduct = useMemo(() => {
    const map = new Map<string, { _id: string; rating: number; comment: string }>();
    (reviewsData?.data ?? []).forEach((r) => {
      const productId = typeof r.product === "object" ? r.product._id : r.product;
      map.set(productId, { _id: r._id, rating: r.rating, comment: r.comment });
    });
    return map;
  }, [reviewsData]);

  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [cancelOrder] = useCancelOrderMutation();
  const [addToCart] = useAddToCartMutation();

  const handleReorder = async (order: Order) => {
    try {
      for (const item of order.items) {
        await addToCart({ productId: item.product, quantity: item.quantity }).unwrap();
      }
      toast.success("Items added to cart");
      router.push("/cart");
    } catch {
      toast.error("Couldn't reorder - some items may be unavailable.");
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await cancelOrder(orderId).unwrap();
      toast.success("Order canceled");
    } catch {
      toast.error("Couldn't cancel order. Please try again.");
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus({ id: orderId, status }).unwrap();
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error("Couldn't update order status.");
    }
  };

  const handleDownload = (order: Order) => {
    generateInvoicePdf(order, user ? `${user.firstName} ${user.lastName}` : "Customer");
  };

  return (
    <>
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
            <li className="text-gray-900 dark:text-white">{isFarmer ? "Orders" : "My Orders"}</li>
          </ol>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isFarmer ? "Customer Orders" : "My Orders"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isFarmer ? "Manage orders containing your products" : "Track and manage your orders"}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | "");
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>

        {isLoading && <ListSkeleton rows={3} />}
        {!isLoading && orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">No orders found.</p>
            {!isFarmer && (
              <Link href="/products" className="text-primary-600 dark:text-primary-400 hover:underline">
                Browse Products
              </Link>
            )}
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order) => {
            const badge = STATUS_BADGES[order.status];
            const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.status === order.status);

            return (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                    <div className="mb-4 lg:mb-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${badge.classes}`}>
                        <i className={`fas ${badge.icon} mr-1`}></i>
                        {order.status}
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ৳{order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-4">
                    {order.items.map((item, i) => {
                      const existingReview = reviewedByProduct.get(item.product);
                      const canReview = !isFarmer && order.status === "delivered";
                      return (
                        <div key={i} className="flex items-center space-x-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.productImage} alt={item.productName} className="w-16 h-16 rounded-lg object-cover" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{item.productName}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Quantity: {item.quantity} {item.unit} • ৳{item.price}/{item.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              ৳{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          {canReview && (
                            <button
                              onClick={() =>
                                setReviewTarget({
                                  productId: item.product,
                                  orderId: order._id,
                                  productName: item.productName,
                                  existingReview,
                                })
                              }
                              className="text-sm text-primary-600 dark:text-primary-400 hover:underline whitespace-nowrap"
                            >
                              {existingReview ? "Edit Review" : "Write Review"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Status Timeline (hidden for canceled orders) */}
                  {order.status !== "canceled" && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Order Status</h4>
                      <div className="flex items-center flex-wrap gap-2 text-sm">
                        {TIMELINE_STEPS.map((step, i) => (
                          <div key={step.status} className="flex items-center">
                            <div
                              className={
                                i <= currentStepIndex
                                  ? "flex items-center text-green-600 dark:text-green-400"
                                  : "flex items-center text-gray-400"
                              }
                            >
                              <i className={`fas ${i <= currentStepIndex ? "fa-check-circle" : "fa-circle"} mr-1`}></i>
                              <span>{step.label}</span>
                            </div>
                            {i < TIMELINE_STEPS.length - 1 && (
                              <div
                                className={`w-8 h-0.5 mx-2 ${i < currentStepIndex ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                              ></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4 flex flex-wrap gap-3 items-center">
                    {isFarmer ? (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDownload(order)}
                          className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition"
                        >
                          <i className="fas fa-download mr-2"></i>
                          Download Invoice
                        </button>
                        <button
                          onClick={() => handleReorder(order)}
                          className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition"
                        >
                          <i className="fas fa-redo mr-2"></i>
                          Reorder
                        </button>
                        {order.status === "pending" && (
                          <button
                            onClick={() => handleCancel(order._id)}
                            className="flex items-center px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg font-medium transition"
                          >
                            <i className="fas fa-times mr-2"></i>
                            Cancel Order
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav aria-label="Pagination">
              <ul className="inline-flex items-center -space-x-px text-gray-600 dark:text-gray-300">
                <li>
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page <= 1}
                    className="block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 disabled:opacity-50"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                </li>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <li key={p}>
                    <button
                      onClick={() => setPage(p)}
                      className={`px-3 py-2 leading-tight border ${
                        p === page
                          ? "text-white bg-primary-600 border-primary-600"
                          : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {p}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                    disabled={page >= pagination.totalPages}
                    className="block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 disabled:opacity-50"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {reviewTarget && (
        <ReviewModal
          productId={reviewTarget.productId}
          orderId={reviewTarget.orderId}
          productName={reviewTarget.productName}
          existingReview={reviewTarget.existingReview}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </>
  );
}
