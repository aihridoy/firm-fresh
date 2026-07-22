import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

export default function MainLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      {modal}
    </>
  );
}
