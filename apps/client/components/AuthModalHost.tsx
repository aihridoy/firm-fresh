"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";

// Opens the login/register modal on any page via the `?auth=login|register`
// query param, so nav links work without dedicated routes.
function Host() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get("auth");

  if (mode !== "login" && mode !== "register") return null;

  const close = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("auth");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return mode === "login" ? (
    <AuthModal title="Welcome back" subtitle="Sign in to your FarmFresh account" onClose={close}>
      <LoginForm onSuccess={close} />
    </AuthModal>
  ) : (
    <AuthModal
      title="Create your account"
      subtitle="Join FarmFresh community today"
      maxWidthClass="max-w-2xl"
      onClose={close}
    >
      <RegisterForm onSuccess={close} />
    </AuthModal>
  );
}

export default function AuthModalHost() {
  return (
    <Suspense fallback={null}>
      <Host />
    </Suspense>
  );
}
