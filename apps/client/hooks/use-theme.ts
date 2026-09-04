"use client";
import { useEffect, useState } from "react";
import { useTheme as useNextTheme } from "next-themes";

type Theme = "light" | "dark";

/**
 * Thin wrapper over next-themes.
 *
 * This used to be a second, independent theme implementation that wrote the
 * `dark` class onto <html> and persisted to localStorage itself — while the
 * next-themes ThemeProvider in the root layout did exactly the same thing,
 * through the same class and the same storage key. Whichever effect ran last
 * won, so the toggle appeared to work intermittently.
 *
 * next-themes owns the theme now. The API is kept so callers do not change.
 */
export function useTheme() {
  const { resolvedTheme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // resolvedTheme is undefined until next-themes has read storage and the
  // system preference, so the toggle stays disabled through the first paint.
  useEffect(() => setMounted(true), []);

  return {
    theme: (resolvedTheme as Theme | undefined) ?? "light",
    toggleTheme: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    mounted,
  };
}
