"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser, selectIsAuthenticated } from "@/lib/api/endpoints/userSlice";
import { useGetFarmerProductsQuery, useTogglePublishMutation, useDeleteProductMutation, Product } from "@/lib/api/endpoints/products";
import { ProductGridSkeleton } from "@/components/Skeleton";

const PAGE_SIZE = 6;

function statusOf(product: Product): { label: string; classes: string } {
  if (!product.isPublished) return { label: "Inactive", classes: "bg-gray-500" };
  if (product.stock === 0) return { label: "Out of Stock", classes: "bg-red-500" };
  if (product.stock <= 10) return { label: "Low Stock", classes: "bg-yellow-500" };
  return { label: "Active", classes: "bg-green-500" };
}

export default function ManageList() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/?auth=login");
    } else if (user && user.userType !== "farmer") {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  const { data, isLoading } = useGetFarmerProductsQuery(user?._id as string, { skip: !user });
  const [togglePublish] = useTogglePublishMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const allProducts = data?.data ?? [];
    return allProducts.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && p.category !== category) return false;
      if (status) {
        const s = statusOf(p).label.toLowerCase().replace(/\s+/g, "-");
        if (status === "active" && s !== "active") return false;
        if (status === "inactive" && s !== "inactive") return false;
        if (status === "out-of-stock" && s !== "out-of-stock") return false;
      }
      return true;
    });
  }, [data, search, category, status]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id).unwrap();
      toast.success(`${name} deleted`);
    } catch {
      toast.error("Couldn't delete product. Please try again.");
    }
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      await togglePublish(id).unwrap();
      toast.success(isPublished ? "Product unpublished" : "Product published");
    } catch {
      toast.error("Couldn't update product status.");
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
            <li className="text-gray-900 dark:text-white">Manage Products</li>
          </ol>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Products</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your product listings and inventory</p>
          </div>
          <Link
            href="/add-product"
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition"
          >
            <i className="fas fa-plus mr-2"></i>
            Add New Product
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="grains">Grains</option>
                <option value="dairy">Dairy</option>
                <option value="herbs">Herbs</option>
                <option value="honey">Honey</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading && (
          <ProductGridSkeleton count={6} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">No products match your filters.</p>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((product) => {
            const status = statusOf(product);
            return (
              <div key={product._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]?.url}
                    alt={product.images[0]?.alt || product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`${status.classes} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                      {status.label}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                    {typeof product.avgRating === "number" && (
                      <div className="flex items-center text-yellow-400">
                        <i className="fas fa-star text-sm"></i>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                          {product.avgRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 capitalize">{product.category}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ৳{product.price}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">/{product.unit}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Stock: {product.stock}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/add-product?edit=${product._id}`}
                      className="flex-1 text-center bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition text-sm"
                    >
                      <i className="fas fa-edit mr-1"></i>Edit
                    </Link>
                    <button
                      onClick={() => handleTogglePublish(product._id, product.isPublished)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                      aria-label={product.isPublished ? "Unpublish" : "Publish"}
                      title={product.isPublished ? "Unpublish" : "Publish"}
                    >
                      <i className={`fas ${product.isPublished ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                      aria-label="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page >= totalPages}
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
    </>
  );
}
