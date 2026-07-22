"use client";

import { ReactNode } from "react";

export default function AuthModal({
  title,
  subtitle,
  maxWidthClass = "max-w-md",
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  maxWidthClass?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const close = onClose;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={close}>
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto p-6 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-500 p-3 rounded-full">
              <i className="fas fa-seedling text-white text-xl"></i>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
