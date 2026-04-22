// src/app/menu/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { scanQRNoLocation, getMenuItems, createOrder, MenuItem } from "@/lib/api";

import { useCartStore } from "@/stores/cart.store";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import MenuItemCard from "@/components/menu/MenuItemCard";
import CategoryTabs from "@/components/menu/CategoryTabs";
import CartSheet from "@/components/menu/CartSheet";
import { ShoppingCart, UtensilsCrossed, Search, X, LayoutGrid, LayoutList } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const init = useCallback(async () => {
    if (!token) {
      toast.error("Invalid QR Code");
      return;
    }

    try {
      // Load menu without requiring location — accessible from anywhere
      const { data: table } = await scanQRNoLocation(token);

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

  // Always show all category groups; only filter by search query
  const visibleGroups = searchQuery.trim()
    ? categoryGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      }))
      .filter((g) => g.items.length > 0)
    : categoryGroups;

  // ── Scroll spy refs ────────────────────────────────────────────
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isProgrammaticScroll = useRef(false);

  // IntersectionObserver: auto-highlight the category tab in view
  useEffect(() => {
    if (visibleGroups.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;
        // Pick the entry closest to the top of the viewport
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.getAttribute("data-category-id");
          if (id) setSelectedCategory(id);
        }
      },
      // Trigger when section enters the top 40% of the screen
      { rootMargin: "-20% 0px -55% 0px", threshold: 0 },
    );
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleGroups.length]);

  // Tab click: scroll to section (or top for "all")
  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = sectionRefs.current.get(catId);
    if (el) {
      isProgrammaticScroll.current = true;
      // Offset for sticky header height (~120px)
      const y = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: y, behavior: "smooth" });
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 800);
    }
  };

  const handleOrder = async () => {
    if (!table_id || !session_id || items.length === 0) return;

    setOrdering(true);
    try {
      // 1. Get current location — user must be at the restaurant to order
      let position: GeolocationPosition;
      try {
        position = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, {
            timeout: 10000,
            maximumAge: 0,
          }),
        );
      } catch {
        toast.error("ບໍ່ສາມາດດຶງຕຳແໜ່ງໄດ້. ກະລຸນາອະນຸຍາດ GPS ແລ້ວລອງໃໝ່.");
        setOrdering(false);
        return;
      }

      // 2. Send order with location — backend will reject if not inside restaurant
      const { data: order } = await createOrder({
        table_id,
        session_id,
        items: items.map((i) => ({
          menu_item_id: i.menuItem.id,
          quantity: i.quantity,
          special_note: i.special_note,
        })),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setCartOpen(false);
      router.push(`/order-status?order_id=${order.id}&table_id=${table_id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Order failed. Please try again.";
      toast.error(msg);
    } finally {
      setOrdering(false);
    }
  };


  // ── Loading State ──────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        {/* Sticky skeleton block */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-100">
          {/* Header row */}
          <div className="px-4 py-3.5">
            <Skeleton className="h-5 w-32 rounded-md" />
          </div>
          {/* Search bar skeleton */}
          <div className="px-4 pb-3">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          {/* Tabs skeleton */}
          <div className="flex gap-2 px-4 py-2.5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-20 rounded-full" />
            ))}
          </div>
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
      {/* ── Sticky top block: Header + Search + Category Tabs ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100">
        {/* Header row — collapses on scroll */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: scrolled ? "0px" : "64px",
            opacity: scrolled ? 0 : 1,
          }}
        >
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-amber-500" />
              <h1 className="text-base font-bold text-slate-800 tracking-tight">
                Menu
              </h1>
            </div>
            {table_id && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                Table #{table_id.slice(-4)}
              </span>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pt-2 pb-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ຄົ້ນຫາເມນູ…"
              className="w-full bg-slate-100 rounded-xl pl-9 pr-9 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-300 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
        />
      </div>

      {/* ── Menu Sections ── */}
      <div className="px-4 pt-2">
        {/* View toggle toolbar */}
        <div className="flex justify-end">
          <div className="flex items-center bg-amber-50 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "grid"
                ? "bg-amber-400 text-white shadow-sm"
                : "text-amber-400 hover:text-amber-500"
                }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-6 w-6" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "list"
                ? "bg-amber-400 text-white shadow-sm"
                : "text-amber-400 hover:text-amber-500"
                }`}
              aria-label="List view"
            >
              <LayoutList className="h-6 w-6" />
            </button>
          </div>
        </div>

        {visibleGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Search className="h-12 w-12 text-slate-200" />
            <p className="text-slate-400 text-sm">
              {searchQuery ? `ບໍ່ພົບ "${searchQuery}"` : "ບໍ່ມີລາຍການ"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-amber-500 text-sm font-medium"
              >
                ລ້າງການຄົ້ນຫາ
              </button>
            )}
          </div>
        ) : (
          visibleGroups.map((group) => (
            <section
              key={group.category.id}
              data-category-id={group.category.id}
              ref={(el) => {
                if (el) sectionRefs.current.set(group.category.id, el);
                else sectionRefs.current.delete(group.category.id);
              }}
            >
              {/* Category heading — handwriting-style */}
              <h2
                className="text-2xl text-slate-700 mb-3 pb-1"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                {group.category.name}
              </h2>

              {/* Items — grid or list */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 gap-3">
                  {group.items.map((item) => (
                    <MenuItemCard key={item.id} item={item} viewMode="grid" />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl px-4 shadow-sm border border-slate-100">
                  {group.items.map((item) => (
                    <MenuItemCard key={item.id} item={item} viewMode="list" />
                  ))}
                </div>
              )}
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
