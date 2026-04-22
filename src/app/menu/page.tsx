// src/app/menu/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { scanQR, getMenuItems, createOrder, MenuItem } from "@/lib/api";
import { useCartStore } from "@/stores/cart.store";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import MenuItemCard from "@/components/menu/MenuItemCard";
import CategoryTabs from "@/components/menu/CategoryTabs";
import CartSheet from "@/components/menu/CartSheet";
import { ShoppingCart, UtensilsCrossed } from "lucide-react";

export default function MenuPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const { setTableInfo, table_id, session_id, items, totalItems, totalPrice } =
    useCartStore();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [ordering, setOrdering] = useState(false);

  const init = useCallback(async () => {
    if (!token) {
      toast.error("Invalid QR Code");
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej),
      );

      const { data: table } = await scanQR(
        token,
        position.coords.latitude,
        position.coords.longitude,
      );

      setTableInfo(table.table_id, table.restaurant_id);

      const { data: menuData } = await getMenuItems(table.restaurant_id);
      setMenuItems(menuData);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Failed to load menu";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [token, setTableInfo]);

  useEffect(() => {
    init();
  }, [init]);

  // Build category list
  const categories = [
    { id: "all", name: "ທັງໝົດ" },
    ...Array.from(
      new Map(menuItems.map((m) => [m.category.id, m.category])).values(),
    ),
  ];

  // Build grouped sections
  const categoryGroups = Array.from(
    new Map(menuItems.map((m) => [m.category.id, m.category])).values(),
  ).map((cat) => ({
    category: cat,
    items: menuItems.filter((m) => m.category.id === cat.id),
  }));

  const visibleGroups =
    selectedCategory === "all"
      ? categoryGroups
      : categoryGroups.filter((g) => g.category.id === selectedCategory);

  const handleOrder = async () => {
    if (!table_id || !session_id || items.length === 0) return;

    setOrdering(true);
    try {
      const { data: order } = await createOrder({
        table_id,
        session_id,
        items: items.map((i) => ({
          menu_item_id: i.menuItem.id,
          quantity: i.quantity,
          special_note: i.special_note,
        })),
      });
      setCartOpen(false);
      router.push(`/order-status?order_id=${order.id}&table_id=${table_id}`);
    } catch {
      toast.error("Order failed. Please try again.");
    } finally {
      setOrdering(false);
    }
  };

  // ── Loading State ──────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        {/* Header skeleton */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 py-3.5">
          <Skeleton className="h-5 w-32 rounded-md" />
        </div>
        {/* Tabs skeleton */}
        <div className="flex gap-2 px-4 py-2.5 border-b border-slate-100">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        {/* Item skeletons */}
        <div className="px-4 pt-6 space-y-6">
          {[...Array(2)].map((_, gi) => (
            <div key={gi} className="space-y-4">
              <Skeleton className="h-7 w-40 rounded-md" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );

  // ── Main Page ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-32">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-amber-500" />
          <h1 className="text-base font-bold text-slate-800 tracking-tight">
            Menu
          </h1>
        </div>
        {/* Table number indicator if available */}
        {table_id && (
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
            Table #{table_id.slice(-4)}
          </span>
        )}
      </div>

      {/* ── Category Tabs ── */}
      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* ── Menu Sections ── */}
      <div className="px-4 pt-2">
        {visibleGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <UtensilsCrossed className="h-12 w-12 text-slate-200" />
            <p className="text-slate-400 text-sm">ບໍ່ມີລາຍການ</p>
          </div>
        ) : (
          visibleGroups.map((group) => (
            <section key={group.category.id} className="mt-6 first:mt-4">
              {/* Category heading — handwriting-style */}
              <h2
                className="text-2xl text-slate-700 mb-3 pb-1"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                {group.category.name}
              </h2>

              {/* Items list */}
              <div className="bg-white rounded-2xl px-4 shadow-sm border border-slate-100">
                {group.items.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* ── Floating Cart FAB ── */}
      {totalItems() > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-4">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full max-w-sm flex items-center justify-between bg-amber-400 active:bg-amber-500 text-white rounded-2xl px-5 py-3.5 shadow-lg shadow-amber-200 transition-all"
          >
            {/* Cart count badge */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 bg-white text-amber-500 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {totalItems()}
                </span>
              </div>
              <span className="text-sm font-semibold">ເບິ່ງຕະກ້າ</span>
            </div>
            {/* Total */}
            <span className="text-sm font-bold">
              ₭{totalPrice().toLocaleString()}
            </span>
          </button>
        </div>
      )}

      {/* ── Cart Sheet ── */}
      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onOrder={handleOrder}
        ordering={ordering}
      />
    </div>
  );
}
