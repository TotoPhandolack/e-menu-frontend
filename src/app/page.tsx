"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function Home() {
  const router = useRouter();
  const { token, admin } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    } else if (admin?.role === "CASHIER") {
      router.replace("/cashier");
    } else {
      router.replace("/dashboard");
    }
  }, [token, admin, router]);

  return null;
  
}
