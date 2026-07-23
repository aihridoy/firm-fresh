"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  useGetAdminProductsQuery,
  useDeleteAdminProductMutation,
  useToggleAdminProductPublishMutation,
  useApproveProductMutation,
  useRejectProductMutation,
  AdminProduct,
} from "@/lib/api/endpoints/admin";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ListSkeleton } from "@/components/Skeleton";
import Pager from "../Pager";
import AdminSelect from "@/components/Select";

const CATEGORIES = ["vegetables", "fruits", "grains", "dairy", "herbs", "honey"];

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [published, setPublished] = useState("");
  const [approval, setApproval] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, isFetching } = useGetAdminProductsQuery({ page, category, published, approval, search: debouncedSearch });
  const [togglePublish] = useToggleAdminProductPublishMutation();
  const [deleteProduct] = useDeleteAdminProductMutation();
  const [approveProduct] = useApproveProductMutation();
  const [rejectProduct] = useRejectProductMutation();

  const products = data?.data ?? [];

  const handleToggle = async (product: AdminProduct) => {
    try {
      const res = await togglePublish(product._id).unwrap();
      toast.success(res.message);
    } catch (err) {
      toast.error((err as { data?: { error?: string } })?.data?.error ?? "Update failed");
    }
  };

  const handleDelete = async (product: AdminProduct) => {
    if (!window.confirm(`Delete "${product.name}"? Its reviews are removed too. This cannot be undone.`)) return;
    try {
      await deleteProduct(product._id).unwrap();
      toast.success("Product deleted");
    } catch (err) {
      toast.error((err as { data?: { error?: string } })?.data?.error ?? "Delete failed");
    }
  };

  const handleApprove = async (product: AdminProduct) => {
    try {
      await approveProduct(product._id).unwrap();
      toast.success(`"${product.name}" approved and published`);
    } catch (err) {
      toast.error((err as { data?: { error?: string } })?.data?.error ?? "Approval failed");
    }
  };

  const handleReject = async (product: AdminProduct) => {
    if (!window.confirm(`Reject "${product.name}"? It will be hidden from the store.`)) return;
    try {
      await rejectProduct(product._id).unwrap();
      toast.success(`"${product.name}" rejected`);
    } catch (err) {
      toast.error((err as { data?: { error?: string } })?.data?.error ?? "Rejection failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Products</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by product name..."
          className="flex-1 min-w-52 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <AdminSelect
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">
              {c}
            </option>
          ))}
        </AdminSelect>
        <AdminSelect
          value={published}
          onChange={(e) => {
            setPublished(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by publish status"
        >
          <option value="">All Publish Status</option>
          <option value="true">Published</option>
          <option value="false">Unpublished</option>
        </AdminSelect>
        <AdminSelect
          value={approval}
          onChange={(e) => {
            setApproval(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by approval status"
        >
          <option value="">All Approval</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </AdminSelect>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-opacity ${isFetching ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Farmer</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Stock</th>
                  <th className="py-2 pr-4">Approval</th>
                  <th className="py-2 pr-4">Published</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.images[0]?.url}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {typeof product.farmer === "object"
                        ? `${product.farmer.firstName} ${product.farmer.lastName}`
                        : "—"}
                    </td>
                    <td className="py-2.5 pr-4 capitalize text-gray-600 dark:text-gray-400">{product.category}</td>
                    <td className="py-2.5 pr-4 text-gray-900 dark:text-white whitespace-nowrap">
                      ৳{product.price}/{product.unit}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">{product.stock}</td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                          product.approvalStatus === "approved"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : product.approvalStatus === "rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {product.approvalStatus}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          product.isPublished
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {product.isPublished ? "Published" : "Unpublished"}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        {product.approvalStatus !== "approved" && (
                          <button
                            onClick={() => handleApprove(product)}
                            className="px-2 py-1 text-xs text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition"
                          >
                            Approve
                          </button>
                        )}
                        {product.approvalStatus === "pending" && (
                          <button
                            onClick={() => handleReject(product)}
                            className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                          >
                            Reject
                          </button>
                        )}
                        {product.approvalStatus === "approved" && (
                          <button
                            onClick={() => handleToggle(product)}
                            className="px-2 py-1 text-xs text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition"
                          >
                            {product.isPublished ? "Unpublish" : "Publish"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(product)}
                          className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                          title="Delete product"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No products found.</p>
            )}
          </div>
          <Pager pagination={data?.pagination} onPage={setPage} />
        </div>
      )}
    </div>
  );
}
