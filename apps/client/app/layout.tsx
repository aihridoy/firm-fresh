import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import Loading from "./loading";
import { ThemeProvider } from "next-themes";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: {
    default: "FarmFresh — Fresh Produce Direct from Local Farmers",
    template: "%s — FarmFresh",
  },
  description:
    "Buy fresh, farm-direct fruits, vegetables, grains, dairy, honey and herbs from local Bangladeshi farmers on FarmFresh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 antialiased"
      >
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
