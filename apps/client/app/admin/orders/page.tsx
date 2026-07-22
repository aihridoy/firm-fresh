"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useGetAdminOrdersQuery, useUpdateAdminOrderStatusMutation, AdminOrder } from "@/lib/api/endpoints/admin";
import { OrderStatus } from "@/lib/api/endpoints/orders";
import { ListSkeleton } from "@/components/Skeleton";
import Pager from "../Pager";
import AdminSelect from "../AdminSelect";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "canceled"];

const STATUS_CLASSES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  canceled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function AdminOrders() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetAdminOrdersQuery({ page, status: (status || undefined) as OrderStatus | undefined });
  const [updateStatus] = useUpdateAdminOrderStatusMutation();

  const orders = data?.data ?? [];

  const handleStatusChange = async (order: AdminOrder, newStatus: OrderStatus) => {
    try {
      await updateStatus({ id: order._id, status: newStatus }).unwrap();
      toast.success(`Order ${order.orderNumber} marked ${newStatus}`);
    } catch (err) {
      toast.error((err as { data?: { error?: string } })?.data?.error ?? "Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Orders</h1>
        <AdminSelect
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </AdminSelect>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Items</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {typeof order.user === "object" ? `${order.user.firstName} ${order.user.lastName}` : "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">{order.items.length}</td>
                    <td className="py-2.5 pr-4 text-gray-900 dark:text-white whitespace-nowrap">৳{order.totalAmount}</td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${STATUS_CLASSES[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <AdminSelect
                        small
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                        aria-label="Update order status"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="capitalize">
                            {s}
                          </option>
                        ))}
                      </AdminSelect>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No orders found.</p>
            )}
          </div>
          <Pager pagination={data?.pagination} onPage={setPage} />
        </div>
      )}
    </div>
  );
}
