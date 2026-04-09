// src/components/menu/MenuItemCard.tsx
"use client";

import { MenuItem } from "@/lib/api";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ChefHat } from "lucide-react";

interface Props {
  item: MenuItem;
}

export default function MenuItemCard({ item }: Props) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.menuItem.id === item.id);
  const quantity = cartItem?.quantity ?? 0;

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm flex flex-col">
      {/* Image */}
      <div className="relative w-full aspect-4/3 bg-slate-100">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-slate-400" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-sm font-medium text-slate-900 truncate">
          {item.name}
        </p>

        <div className="mt-auto pt-2 flex justify-between items-center">
          <p className="text-sm font-semibold text-slate-900">
            ₭{Number(item.price).toLocaleString()}
          </p>

          {quantity > 0 ? (
            <div className="flex items-center gap-1.5">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                onClick={() => updateQuantity(item.id, quantity - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-medium w-4 text-center">
                {quantity}
              </span>
              <Button
                size="icon"
                className="h-7 w-7"
                onClick={() => addItem(item)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => addItem(item)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
