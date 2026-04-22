// src/components/menu/MenuItemCard.tsx
"use client";

import { MenuItem } from "@/lib/api";
import { useCartStore } from "@/stores/cart.store";
import { ChefHat, Plus, Minus } from "lucide-react";

interface Props {
  item: MenuItem;
  viewMode?: "grid" | "list";
}

export default function MenuItemCard({ item, viewMode = "list" }: Props) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.menuItem.id === item.id);
  const quantity = cartItem?.quantity ?? 0;

  // ── Grid Card (2-column) ────────────────────────────────────────
  if (viewMode === "grid") {
    return (
      <div className="flex flex-col">
        {/* Image — standalone with border radius */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100">
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

          {/* Unavailable overlay */}
          {!item.is_available && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-400">ໝົດ</span>
            </div>
          )}

          {/* + / qty controls — overlaid bottom-right */}
          <div className="absolute bottom-2 right-2">
            {quantity > 0 ? (
              <div className="flex items-center gap-1 bg-white rounded-full px-1.5 py-1 shadow-md">
                <button
                  className="w-6 h-6 rounded-full border border-slate-200 text-slate-500 flex items-center justify-center active:bg-slate-50 transition-colors"
                  onClick={() => updateQuantity(item.id, quantity - 1)}
                  aria-label="Decrease"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-xs font-bold text-slate-800 w-4 text-center">
                  {quantity}
                </span>
                <button
                  className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center active:bg-amber-500 transition-colors disabled:opacity-40"
                  onClick={() => addItem(item)}
                  disabled={!item.is_available}
                  aria-label="Increase"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                className="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-md active:bg-amber-500 transition-colors disabled:opacity-40"
                onClick={() => addItem(item)}
                disabled={!item.is_available}
                aria-label="Add to cart"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Text — outside the image, below */}
        <div className="pt-2 pb-2">
          <div className="flex flex-row gap-2">
            <p className="text-lg font-semibold text-slate-800 leading-snug line-clamp-2">
              {item.name}
            </p>
            {item.description && (
              <p className="text-lg text-slate-400 line-clamp-1">
                {item.description}
              </p>
            )}
          </div>

          <p className="text-sm font-bold text-amber-500">
            ₭{Number(item.price).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  // ── List Row (horizontal) ───────────────────────────────────────
  return (
    <div className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0">
      {/* Photo */}
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

      {/* Text */}
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

      {/* Quantity Controls */}
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
