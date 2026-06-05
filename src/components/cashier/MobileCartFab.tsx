// src/components/cashier/MobileCartFab.tsx
"use client";

import { ShoppingBag } from "lucide-react";

interface Props {
  cartItemCount: number;
  mobileOrderOpen: boolean;
  onOpen: () => void;
}

export function MobileCartFab({ cartItemCount, mobileOrderOpen, onOpen }: Props) {
  return (
    <button
      className={`fixed bottom-6 right-6 z-30 flex md:hidden bg-primary text-primary-foreground rounded-full w-14 h-14 items-center justify-center shadow-xl transition-opacity duration-200${
        mobileOrderOpen ? " opacity-0 pointer-events-none" : " opacity-100"
      }`}
      onClick={onOpen}
      aria-label="Open order panel"
    >
      <ShoppingBag size={22} strokeWidth={2} />
      {cartItemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold min-w-5 h-5 rounded-full flex items-center justify-center px-1">
          {cartItemCount}
        </span>
      )}
    </button>
  );
}
