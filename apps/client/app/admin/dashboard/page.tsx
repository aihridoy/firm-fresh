"use client";

import Link from "next/link";
import { useGetAdminDashboardQuery, useGetPendingFarmersQuery, useGetPendingProductsQuery } from "@/lib/api/endpoints/admin";
import { ListSkeleton } from "@/components/Skeleton";

const STATUS_CLASSES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  canceled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function AdminDashboard() {
  const { data, isLoading } = useGetAdminDashboardQuery();
  const { data: pendingFarmersData } = useGetPendingFarmersQuery({ status: "pending" });
  const { data: pendingProductsData } = useGetPendingProductsQuery({ status: "pending" });
  const stats = data?.data;

  if (isLoading || !stats) return <ListSkeleton rows={4} />;

  const pendingFarmers = pendingFarmersData?.pagination?.total ?? 0;
  const pendingProducts = pendingProductsData?.pagination?.total ?? 0;

  const cards = [
    { label: "Total Users", value: stats.users.total, icon: "fa-users", color: "text-blue-500" },
    { label: "Customers", value: stats.users.customers, icon: "fa-user", color: "text-teal-500" },
    { label: "Farmers", value: stats.users.farmers, icon: "fa-tractor", color: "text-green-500" },
    { label: "Pending Farmers", value: pendingFarmers, icon: "fa-clock", color: "text-yellow-500", href: "/admin/farmers" },
    { label: "Products", value: stats.totalProducts, icon: "fa-box", color: "text-orange-500" },
    { label: "Pending Products", value: pendingProducts, icon: "fa-clock", color: "text-yellow-500", href: "/admin/products" },
    { label: "Orders", value: stats.totalOrders, icon: "fa-shopping-bag", color: "text-purple-500" },
    { label: "Revenue", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: "fa-coins", color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const content = (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
                </div>
                <i className={`fas ${card.icon} text-2xl ${card.color}`}></i>
              </div>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href} className="block hover:opacity-90 transition">
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-white">{order.orderNumber}</td>
                  <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">
                    {typeof order.user === "object" ? `${order.user.firstName} ${order.user.lastName}` : "—"}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-900 dark:text-white">৳{order.totalAmount}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${STATUS_CLASSES[order.status] ?? ""}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h2>
          <Link href="/admin/users" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr key={user._id} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="py-2.5 pr-4 capitalize text-gray-600 dark:text-gray-400">{user.userType}</td>
                  <td className="py-2.5 text-gray-600 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
