"use client";

import { SelectHTMLAttributes } from "react";

// Native <select> with the browser arrow replaced by a centered chevron
// and balanced padding. `small` is for in-table row actions.
// `selectClassName` fully replaces the default size classes (padding + text size)
// so forms can match neighboring inputs.
export default function Select({
  className = "",
  small = false,
  selectClassName,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { small?: boolean; selectClassName?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <select
        {...props}
        className={`w-full appearance-none border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white capitalize focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-40 ${
          selectClassName ?? (small ? "pl-2.5 pr-7 py-1.5 text-xs" : "pl-3 pr-9 py-2 text-sm")
        }`}
      >
        {children}
      </select>
      <i
        className={`fas fa-chevron-down pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400 ${
          small ? "right-2.5 text-[10px]" : "right-3 text-xs"
        }`}
      ></i>
    </span>
  );
}
