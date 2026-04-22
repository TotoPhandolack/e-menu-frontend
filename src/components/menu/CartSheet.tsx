// src/components/menu/CartSheet.tsx
"use client";

import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Minus, Plus, ChefHat } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onOrder: () => void;
  ordering: boolean;
}

export default function CartSheet({ open, onClose, onOrder, ordering }: Props) {
  const { items, updateQuantity, totalPrice } = useCartStore();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col rounded-t-2xl">
        <SheetHeader className="pb-2 border-b border-slate-100">
          <SheetTitle className="text-base font-semibold text-slate-800">
            🛒 ລາຍການອາຫານ
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <ChefHat className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">ຍັງບໍ່ມີລາຍການ</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map(({ menuItem, quantity }) => (
                <li key={menuItem.id} className="flex items-center gap-3 py-3 px-1">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {menuItem.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={menuItem.image_url}
                        alt={menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-5 w-5 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {menuItem.name}
                    </p>
                    <p className="text-xs text-amber-600 font-semibold mt-0.5">
                      ₭{(Number(menuItem.price) * quantity).toLocaleString()}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="w-8 h-8 rounded-full border border-slate-200 text-slate-500 flex items-center justify-center active:bg-slate-50"
                      onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                      aria-label="Decrease"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-semibold text-slate-800 w-5 text-center">
                      {quantity}
                    </span>
                    <button
                      className="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center active:bg-amber-500"
                      onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                      aria-label="Increase"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <SheetFooter className="flex-col gap-3 pt-3 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">ລວມທັງໝົດ</span>
            <span className="text-base font-bold text-slate-900">
              ₭{totalPrice().toLocaleString()}
            </span>
          </div>
          <Button
            className="w-full h-12 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white font-semibold text-base rounded-xl shadow-md shadow-amber-200 transition-all"
            disabled={items.length === 0 || ordering}
            onClick={onOrder}
          >
            {ordering ? "ກຳລັງສັ່ງ..." : "ສັ່ງອາຫານ"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
