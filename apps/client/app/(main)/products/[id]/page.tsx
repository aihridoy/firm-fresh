import type { Metadata } from "next";
import ProductDetailsClient from "./ProductDetailsClient";

interface ProductForMeta {
  name: string;
  description: string;
  images: { url: string; alt: string }[];
}

async function fetchProduct(id: string): Promise<ProductForMeta | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const res = await fetch(`${base}/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = await res.json();
    return body.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const description = product.description.slice(0, 160);
  const image = product.images[0]?.url;

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} — FarmFresh`,
      description,
      images: image ? [{ url: image, width: 1200, height: 630, alt: product.images[0].alt }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — FarmFresh`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailsClient id={id} />;
}
