// src/app/menu/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { scanQR, getMenuItems, createOrder, MenuItem } from "@/lib/api";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import MenuItemCard from "@/components/menu/MenuItemCard";
import CategoryTabs from "@/components/menu/CategoryTabs";
import CartSheet from "@/components/menu/CartSheet";
import { ShoppingCart } from "lucide-react";

export default function MenuPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const { setTableInfo, table_id, session_id, items, totalItems } =
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
      // 1. ขอ GPS จาก browser
      const position = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej),
      );

      // 2. scan QR + เช็ค location
      const { data: table } = await scanQR(
        token,
        position.coords.latitude,
        position.coords.longitude,
      );

      // 3. เก็บ table info ใน store
      setTableInfo(table.table_id, table.restaurant_id);

      // 4. ดึงเมนู
      const { data: items } = await getMenuItems(table.restaurant_id);
      setMenuItems(items);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to load menu";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    init();
  }, [init]);

  // จัดกลุ่มเมนูตาม category
  const categories = [
    { id: "all", name: "ທັງໝົດ" },
    ...Array.from(
      new Map(menuItems.map((m) => [m.category.id, m.category])).values(),
    ),
  ];

  const filtered =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((m) => m.category.id === selectedCategory);

  const handleOrder = async () => {

    console.log('table_id:', table_id);
    console.log('session_id:', session_id);
    console.log('items:', items);

    if (!table_id || !session_id || items.length === 0) {
      console.log('blocked here!'); // ถ้าขึ้นตรงนี้แปลว่า store ไม่มีค่า
      return;
    }

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

  if (loading)
    return (
      <div className="p-4 space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Menu</h1>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems() > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
              {totalItems()}
            </Badge>
          )}
        </Button>
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Menu Items */}
      <div className="p-4 space-y-3">
        {filtered.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Cart Sheet */}
      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onOrder={handleOrder}
        ordering={ordering}
      />
    </div>
  );
}
