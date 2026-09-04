import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import Loading from "./loading";
import { ThemeProvider } from "next-themes";
import { Providers } from "@/lib/providers";
import AuthModalHost from "@/components/AuthModalHost";

export const metadata: Metadata = {
  metadataBase: new URL("https://firm-fresh.vercel.app"),
  title: {
    default: "FarmFresh — Fresh Produce Direct from Local Farmers",
    template: "%s — FarmFresh",
  },
  description:
    "Buy fresh, farm-direct fruits, vegetables, grains, dairy, honey and herbs from local Bangladeshi farmers on FarmFresh.",
  openGraph: {
    type: "website",
    siteName: "FarmFresh",
    url: "https://firm-fresh.vercel.app",
    title: "FarmFresh — Fresh Produce Direct from Local Farmers",
    description:
      "Buy fresh, farm-direct fruits, vegetables, grains, dairy, honey and herbs from local Bangladeshi farmers on FarmFresh.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FarmFresh — connect directly with local farmers for farm-direct produce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FarmFresh — Fresh Produce Direct from Local Farmers",
    description:
      "Buy fresh, farm-direct fruits, vegetables, grains, dairy, honey and herbs from local Bangladeshi farmers on FarmFresh.",
    images: ["/og-image.png"],
  },
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
            <AuthModalHost />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
