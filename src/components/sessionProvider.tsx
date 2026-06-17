// src/components/sessionProvider.tsx
"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { setAccessToken } from "@/lib/api";

// Push the session's access token into the axios client whenever it changes,
// so API requests don't each call getSession() (which hits /api/auth/session).
function TokenSync() {
  const { data } = useSession();
  useEffect(() => {
    setAccessToken(data?.accessToken ?? null);
  }, [data?.accessToken]);
  return null;
}

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <TokenSync />
      {children}
    </SessionProvider>
  );
}
