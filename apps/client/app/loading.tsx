export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Animated Logo */}
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary-500 p-4 rounded-full animate-pulse">
              <i className="fas fa-seedling text-white text-3xl"></i>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Loading...
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please wait while we load the page.
          </p>
        </div>

        {/* Loading Dots Animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
