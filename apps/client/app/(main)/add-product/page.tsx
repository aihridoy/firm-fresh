"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser, selectIsAuthenticated } from "@/lib/api/endpoints/userSlice";
import { useCreateProductMutation, useUpdateProductMutation, useGetProductByIdQuery } from "@/lib/api/endpoints/products";
import Select from "@/components/Select";

const CATEGORIES = ["vegetables", "fruits", "grains", "dairy", "herbs", "honey"];
const UNITS = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "lbs", label: "Pounds (lbs)" },
  { value: "piece", label: "Piece" },
  { value: "liter", label: "Liter" },
  { value: "dozen", label: "Dozen" },
  { value: "bundle", label: "Bundle" },
];
const FEATURES = [
  { value: "organic", label: "Organic" },
  { value: "pesticide-free", label: "Pesticide Free" },
  { value: "fresh", label: "Fresh" },
  { value: "non-gmo", label: "Non-GMO" },
  { value: "local", label: "Local" },
  { value: "sustainable", label: "Sustainable" },
  { value: "fair-trade", label: "Fair Trade" },
  { value: "gluten-free", label: "Gluten-Free" },
];

export default function AddProduct() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  const { data: existingProduct } = useGetProductByIdQuery(editId as string, { skip: !editId });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [stock, setStock] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user && user.userType !== "farmer") {
      router.replace("/");
    }
    if (!isAuthenticated) {
      router.replace("/?auth=login");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (existingProduct?.data) {
      const p = existingProduct.data;
      setName(p.name);
      setCategory(p.category);
      setDescription(p.description);
      setPrice(String(p.price));
      setUnit(p.unit);
      setStock(String(p.stock));
      setFarmLocation(p.farmLocation);
      setHarvestDate(p.harvestDate ? p.harvestDate.slice(0, 10) : "");
      setFeatures(p.features);
    }
  }, [existingProduct]);

  // After all hooks: show message if farmer is not approved
  if (isAuthenticated && user && user.userType === "farmer" && user.approvalStatus !== "approved") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-clock text-3xl text-yellow-600 dark:text-yellow-400"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Account Pending Approval</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your farmer account is awaiting admin approval. You will be able to add products once your account is approved.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white py-2 px-6 rounded-lg font-medium transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const toggleFeature = (value: string) => {
    setFeatures((prev) => (prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setImageFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!editId && imageFiles.length === 0) {
      setError("Please upload at least one product image.");
      return;
    }
    if (parseFloat(price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }
    if (parseInt(stock, 10) < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("unit", unit);
    formData.append("stock", stock);
    formData.append("farmLocation", farmLocation);
    if (harvestDate) formData.append("harvestDate", harvestDate);
    features.forEach((f) => formData.append("features", f));
    imageFiles.forEach((file) => formData.append("images", file));

    try {
      if (editId) {
        await updateProduct({ id: editId, formData }).unwrap();
        toast.success("Product updated");
      } else {
        await createProduct(formData).unwrap();
        toast.success("Product added");
      }
      router.push("/manage-list");
    } catch (err) {
      const message = (err as { data?: { error?: string } })?.data?.error || "Something went wrong. Please try again.";
      setError(message);
    }
  };

  const isSubmitting = isCreating || isUpdating;

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
            <li>
              <Link href="/manage-list" className="text-gray-500 hover:text-primary-600">
                Manage Products
              </Link>
            </li>
            <li>
              <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
            </li>
            <li className="text-gray-900 dark:text-white">{editId ? "Edit Product" : "Add Product"}</li>
          </ol>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-primary-600 text-white px-8 py-6">
            <h1 className="text-3xl font-bold">{editId ? "Edit Product" : "Add New Product"}</h1>
            <p className="text-primary-100 mt-2">Share your fresh produce with customers</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-4">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Organic Tomatoes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                  <Select
                    className="w-full"
                    selectClassName="pl-4 pr-10 py-3"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Describe your product, growing methods, quality, etc."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pricing & Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price per Unit (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="45.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit *</label>
                  <Select
                    className="w-full"
                    selectClassName="pl-4 pr-10 py-3"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="">Select Unit</option>
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Product Images</h2>
              <label
                htmlFor="images"
                className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 transition cursor-pointer"
              >
                <input type="file" id="images" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : "Click to upload images"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Up to 5 images{editId ? " (leave empty to keep existing)" : ""}</p>
              </label>

              {imageFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imageFiles.map((file, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {editId && imageFiles.length === 0 && existingProduct?.data?.images && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {existingProduct.data.images.map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={img.url} alt={img.alt} className="w-full aspect-square object-cover rounded-lg" />
                  ))}
                </div>
              )}
            </div>

            {/* Farm Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Farm Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Farm Location *</label>
                  <input
                    type="text"
                    required
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Sylhet, Bangladesh"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Harvest Date</label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Product Features */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Product Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {FEATURES.map((feature) => (
                  <label
                    key={feature.value}
                    className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={features.includes(feature.value)}
                      onChange={() => toggleFeature(feature.value)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition"
              >
                {isSubmitting ? "Saving..." : editId ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
