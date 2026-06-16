// src/types/next-auth.d.ts
import type { Admin } from "@/lib/api";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    admin?: Admin;
  }

  interface User {
    accessToken?: string;
    admin?: Admin;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    admin?: Admin;
  }
}
