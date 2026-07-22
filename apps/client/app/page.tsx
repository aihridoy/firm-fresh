import Categories from "@/components/Categories";
import Choose from "@/components/Choose";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import JoinFarmerCTA from "@/components/JoinFarmerCTA";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import SeasonalPicks from "@/components/SeasonalPicks";
import Testimonials from "@/components/Testimonials";
import TopFarmers from "@/components/TopFarmers";
import type { Metadata } from "next";

const OG_IMAGE = "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=1200&h=630&fit=crop";

export const metadata: Metadata = {
  title: { absolute: "FarmFresh — Fresh Produce Direct from Local Farmers" },
  description:
    "Buy fresh, farm-direct fruits, vegetables, grains, dairy, honey and herbs from local Bangladeshi farmers on FarmFresh.",
  openGraph: {
    title: "FarmFresh — Fresh Produce Direct from Local Farmers",
    description:
      "Buy fresh, farm-direct fruits, vegetables, grains, dairy, honey and herbs from local Bangladeshi farmers on FarmFresh.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Fresh produce from FarmFresh" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FarmFresh — Fresh Produce Direct from Local Farmers",
    description:
      "Buy fresh, farm-direct fruits, vegetables, grains, dairy, honey and herbs from local Bangladeshi farmers on FarmFresh.",
    images: [OG_IMAGE],
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Categories />
      <TopFarmers />
      <FeaturedProducts />
      <Testimonials />
      <Choose />
      <SeasonalPicks />
      <Newsletter />
      <JoinFarmerCTA />
      <Footer />
    </>
  );
}
