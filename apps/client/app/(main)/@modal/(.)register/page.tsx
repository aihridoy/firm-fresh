"use client";

import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterModal() {
  const router = useRouter();

  return (
    <AuthModal title="Create your account" subtitle="Join FarmFresh community today" maxWidthClass="max-w-2xl">
      <RegisterForm onSuccess={() => router.back()} />
    </AuthModal>
  );
}
