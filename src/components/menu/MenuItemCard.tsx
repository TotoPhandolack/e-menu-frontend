// src/components/menu/MenuItemCard.tsx
"use client";

import { MenuItem } from "@/lib/api";
import { useCartStore } from "@/stores/cart.store";
import { ChefHat, Plus, Minus } from "lucide-react";

interface Props {
  item: MenuItem;
}

export default function MenuItemCard({ item }: Props) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.menuItem.id === item.id);
  const quantity = cartItem?.quantity ?? 0;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0">
      {/* Photo — large square, matches reference */}
      <div className="relative flex-shrink-0 w-[104px] h-[104px] rounded-2xl overflow-hidden bg-slate-100">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="h-10 w-10 text-slate-300" />
          </div>
        )}
        {!item.is_available && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-medium text-slate-400">ໝົດ</span>
          </div>
        )}
      </div>

      {/* Text — name, subtitle, price */}
      <div className="flex-1 min-w-0 self-center">
        <p className="text-[15px] font-semibold text-slate-800 leading-snug line-clamp-2">
          {item.name}
        </p>
        {item.description && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-snug">
            {item.description}
          </p>
        )}
        <p className="text-[15px] font-bold text-amber-500 mt-1.5">
          ₭{Number(item.price).toLocaleString()}
        </p>
      </div>

      {/* Quantity Controls — stacked vertically on the right */}
      <div className="flex-shrink-0 flex items-center gap-1.5">
        {quantity > 0 ? (
          <>
            <button
              className="w-8 h-8 rounded-full border border-slate-200 text-slate-500 flex items-center justify-center active:bg-slate-50 transition-colors"
              onClick={() => updateQuantity(item.id, quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm font-bold text-slate-800 w-5 text-center">
              {quantity}
            </span>
            <button
              className="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center active:bg-amber-500 transition-colors disabled:opacity-40"
              onClick={() => addItem(item)}
              disabled={!item.is_available}
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            className="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center active:bg-amber-500 transition-colors disabled:opacity-40"
            onClick={() => addItem(item)}
            disabled={!item.is_available}
            aria-label="Add to cart"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
