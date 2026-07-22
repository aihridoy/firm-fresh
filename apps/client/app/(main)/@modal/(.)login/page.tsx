"use client";

import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import LoginForm from "@/components/LoginForm";

export default function LoginModal() {
  const router = useRouter();

  return (
    <AuthModal title="Welcome back" subtitle="Sign in to your FarmFresh account">
      <LoginForm onSuccess={() => router.back()} />
    </AuthModal>
  );
}
