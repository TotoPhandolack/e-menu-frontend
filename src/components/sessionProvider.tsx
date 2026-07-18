// src/components/sessionProvider.tsx
"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { useLangStore } from "@/stores/langStore";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load the persisted UI language once for the whole app.
  useEffect(() => {
    useLangStore.getState().hydrate();
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
