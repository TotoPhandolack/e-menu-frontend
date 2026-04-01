// src/components/menu/MenuItemCard.tsx
"use client";

import { MenuItem } from "@/lib/api";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface Props {
  item: MenuItem;
}

export default function MenuItemCard({ item }: Props) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.menuItem.id === item.id);
  const quantity = cartItem?.quantity ?? 0;

  return (
    <div className="bg-white rounded-xl p-4 flex gap-3 shadow-sm">
      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.name}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{item.name}</p>
        <p className="text-sm text-slate-500 line-clamp-2">
          {item.description}
        </p>
        <p className="mt-1 font-semibold text-slate-900">
          ₭{Number(item.price).toLocaleString()}
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-1">
        {quantity > 0 ? (
          <>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium w-4 text-center">
              {quantity}
            </span>
            <Button
              size="icon"
              className="h-8 w-8"
              onClick={() => addItem(item)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <Button size="icon" className="h-8 w-8" onClick={() => addItem(item)}>
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
