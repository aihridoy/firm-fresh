import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import FarmerApprovalBanner from "@/components/FarmerApprovalBanner";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <FarmerApprovalBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
