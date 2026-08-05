// src/app/(customer)/menu/components/cartSheet.tsx
"use client";

import { resolveImageUrl } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import { useTranslations } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Minus, Plus, ChefHat, ShoppingCart } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onOrder: () => void;
  ordering: boolean;
  browseMode?: boolean;
}

export default function CartSheet({ open, onClose, onOrder, ordering, browseMode }: Props) {
  const t = useTranslations();
  const { items, updateQuantity, totalPrice } = useCartStore();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col rounded-t-2xl" aria-describedby={undefined}>
        <SheetHeader className="pb-2 border-b border-border">
          <SheetTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            {t.customer.cart.yourOrder}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ChefHat className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{t.customer.cart.empty}</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map(({ menuItem, quantity }) => (
                <li key={menuItem.id} className="flex items-center gap-3 py-3 px-1">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    {resolveImageUrl(menuItem.imge_url ?? menuItem.image_url) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveImageUrl(menuItem.imge_url ?? menuItem.image_url)}
                        alt={menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {menuItem.name}
                    </p>
                    <p className="text-xs text-status-preparing-foreground font-semibold mt-0.5">
                      ₭{(Number(menuItem.price) * quantity).toLocaleString()}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      className="w-8 h-8 rounded-full border border-border text-muted-foreground flex items-center justify-center active:bg-muted"
                      onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                      aria-label="Decrease"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-semibold text-foreground w-5 text-center">
                      {quantity}
                    </span>
                    <button
                      className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:bg-primary/90"
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

        <SheetFooter className="flex-col gap-3 pt-3 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t.customer.cart.total}</span>
            <span className="text-base font-bold text-foreground">
              ₭{totalPrice().toLocaleString()}
            </span>
          </div>
          {browseMode ? (
            <div className="w-full h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary-strong text-sm font-semibold">
              {t.customer.cart.tellStaff}
            </div>
          ) : (
            <Button
              className="w-full h-12 bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground font-semibold text-base rounded-xl shadow-md transition-all"
              disabled={items.length === 0 || ordering}
              onClick={onOrder}
            >
              {ordering ? t.customer.cart.ordering : t.customer.cart.orderFood}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
