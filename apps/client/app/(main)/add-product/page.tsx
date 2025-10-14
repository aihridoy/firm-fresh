export default function AddProduct() {
  return (
    <>
      {/* <!-- Breadcrumb --> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a
                href="index.html"
                className="text-gray-500 hover:text-primary-600"
              >
                Home
              </a>
            </li>
            <li>
              <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
            </li>
            <li>
              <a
                href="manageList.html"
                className="text-gray-500 hover:text-primary-600"
              >
                Manage Products
              </a>
            </li>
            <li>
              <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
            </li>
            <li className="text-gray-900 dark:text-white">Add Product</li>
          </ol>
        </nav>
      </div>

      {/* <!-- Add Product Form --> */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* <!-- Header --> */}
          <div className="bg-primary-600 text-white px-8 py-6">
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <p className="text-primary-100 mt-2">
              Share your fresh produce with customers
            </p>
          </div>

          {/* <!-- Form --> */}
          <form
            className="p-8 space-y-8"
            action="#"
            method="POST"
            encType="multipart/form-data"
          >
            {/* <!-- Basic Information --> */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="productName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Organic Tomatoes"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains</option>
                    <option value="dairy">Dairy</option>
                    <option value="herbs">Herbs</option>
                    <option value="honey">Honey</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Describe your product, growing methods, quality, etc."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* <!-- Pricing & Inventory --> */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Pricing & Inventory
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Price per Unit (৳) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="45.00"
                  />
                </div>

                <div>
                  <label
                    htmlFor="unit"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Unit *
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Unit</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="lbs">Pounds (lbs)</option>
                    <option value="piece">Piece</option>
                    <option value="liter">Liter</option>
                    <option value="dozen">Dozen</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    min="0"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            {/* <!-- Product Images --> */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Product Images
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="images"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Upload Images (Max 5 images) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 transition">
                    <input
                      type="file"
                      id="images"
                      name="images"
                      multiple
                      accept="image/*"
                      required
                      className="hidden"
                    />
                    <label htmlFor="images" className="cursor-pointer">
                      <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Click to upload images
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </label>
                  </div>
                  <div
                    id="imagePreview"
                    className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 hidden"
                  ></div>
                </div>
              </div>
            </div>

            {/* <!-- Farm Information --> */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Farm Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="farmLocation"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Farm Location *
                  </label>
                  <input
                    type="text"
                    id="farmLocation"
                    name="farmLocation"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Sylhet, Bangladesh"
                  />
                </div>

                <div>
                  <label
                    htmlFor="harvestDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    id="harvestDate"
                    name="harvestDate"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* <!-- Product Features --> */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Product Features
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    name="features[]"
                    value="organic"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm">Organic</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    name="features[]"
                    value="pesticide-free"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm">Pesticide Free</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    name="features[]"
                    value="fresh"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm">Fresh</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    name="features[]"
                    value="non-gmo"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm">Non-GMO</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    name="features[]"
                    value="local"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm">Local</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    name="features[]"
                    value="sustainable"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm">Sustainable</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    name="features[]"
                    value="fair-trade"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm">Fair Trade</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    name="features[]"
                    value="gluten-free"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm">Gluten-Free</span>
                </label>
              </div>
            </div>

            {/* <!-- Submit Button --> */}
            <div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition"
              >
                Add Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
