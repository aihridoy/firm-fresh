"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
          <i className="fas fa-triangle-exclamation text-2xl text-red-600 dark:text-red-400"></i>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            An unexpected error occurred. You can try again or head back home.
          </p>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
