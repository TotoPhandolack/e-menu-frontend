// src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";
import type { AuthResponse } from "@/lib/api";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        try {
          const { data } = await axios.post<AuthResponse>(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            { email, password },
          );
          if (!data?.access_token) return null;
          return {
            id: data.admin.id,
            name: data.admin.name,
            email: data.admin.email,
            accessToken: data.access_token,
            admin: data.admin,
          };
        } catch {
          // Invalid credentials (or backend unreachable) → treat as failed login.
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.admin = user.admin;
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken;
      session.admin = token.admin;
      return session;
    },
  },
});
