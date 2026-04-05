// src/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Admin } from '@/lib/api';

interface AuthStore {
    token: string | null;
    admin: Admin | null;
    setAuth: (token: string, admin: Admin) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            token: null,
            admin: null,

            setAuth: (token, admin) => set({ token, admin }),

            logout: () => set({ token: null, admin: null }),

            isAuthenticated: () => !!get().token,
        }),
        {
            name: 'auth-storage', // เก็บใน localStorage
        },
    ),
);