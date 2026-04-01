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
import { Minus, Plus, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onOrder: () => void;
  ordering: boolean;
}

export default function CartSheet({ open, onClose, onOrder, ordering }: Props) {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>ລາຍການອາຫານ</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {items.length === 0 ? (
            <p className="text-center text-slate-500 py-8">ຍັງບໍ່ມີລາຍການ</p>
          ) : (
            items.map(({ menuItem, quantity }) => (
              <div key={menuItem.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {menuItem.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    ₭{(Number(menuItem.price) * quantity).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm w-4 text-center">{quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-500"
                    onClick={() => removeItem(menuItem.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <SheetFooter className="flex-col gap-2">
          <div className="flex justify-between text-base font-semibold">
            <span>ລວມທັງໝົດ</span>
            <span>₭{totalPrice().toLocaleString()}</span>
          </div>
          <Button
            className="w-full"
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
