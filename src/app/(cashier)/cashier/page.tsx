"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { playDing } from "@/lib/sound";
import { printBill } from "@/lib/printBill";

import { CashierHeader } from "./components/cashierHeader";
import { RestaurantProfileDialog, applyTheme } from "./components/restaurantProfileDialog";
import { TakeawayPaymentDialog } from "./components/takeawayPaymentDialog";
import { MobileCartFab } from "./components/mobileCartFab";
import { MenuSection } from "./components/menuSection";
import { MenuManageTab } from "./components/menuManageTab";
import { TableManageTab } from "./components/tableManageTab";
import { OrderPanel, type CartItem } from "./components/orderPanel";
import { LiveOrdersTab } from "./components/liveOrdersTab";
import { OrderHistoryTab } from "./components/orderHistoryTab";

import { useSession, signOut } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";
import { useTranslations } from "@/lib/i18n";
import {
  getMenuItems,
  cashierGetMenuItems,
  getTables,
  cashierCreateOrder,
  cashierOpenTable,
  cashierGetLiveOrders,
  cashierGetOrderHistory,
  cashierPrintKitchen,
  updateOrderStatus,
  type MenuItem,
  type TableInfo,
  type Order,
  type OrderStatus,
  type OrderType,
} from "@/lib/api";

export default function CashierPage() {
  const { data: session } = useSession();
  const admin = session?.admin ?? null;
  const t = useTranslations();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("TABLE");
  const [creating, setCreating] = useState(false);

  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [manageItems, setManageItems] = useState<MenuItem[]>([]);
  const [manageLoading, setManageLoading] = useState(false);

  const [manageTables, setManageTables] = useState<TableInfo[]>([]);
  const [manageTablesLoading, setManageTablesLoading] = useState(false);

  const [mobileOrderOpen, setMobileOrderOpen] = useState(false);

  const [pendingTakeawayOrder, setPendingTakeawayOrder] = useState<Order | null>(null);
  const [takeawayPayment, setTakeawayPayment] = useState<"CASH" | "QR">("CASH");

  const [profileOpen, setProfileOpen] = useState(false);
  const [localAdmin, setLocalAdmin] = useState(admin);

  const [mainTab, setMainTab] = useState("order");
  const [activitySubTab, setActivitySubTab] = useState("live");
  const [highlightOrder, setHighlightOrder] = useState<
    { orderId: string; status: OrderStatus; nonce: number } | null
  >(null);

  // Keep localAdmin in sync with auth store and re-apply theme whenever it changes
  useEffect(() => {
    setLocalAdmin(admin);
    // Always apply — an unset theme_color has to reset --primary back to the
    // default gold, not leave whatever a previously visited page injected.
    applyTheme(admin?.restaurant?.theme_color);
  }, [admin]);

  // Keyed on the restaurant id (a stable string), NOT the `admin` object —
  // next-auth refetches the session on every window focus, which hands back a
  // new object with identical contents. Depending on the object made this
  // effect re-run (and re-show the skeleton) every time the tab regained focus.
  const restaurantId = admin?.restaurant_id ?? null;

  useEffect(() => {
    if (!restaurantId) return;
    setMenuLoading(true);
    Promise.all([getMenuItems(restaurantId), getTables(restaurantId)])
      .then(([menuRes, tableRes]) => {
        setMenuItems(menuRes.data);
        setTables(tableRes.data);
      })
      .catch(() => toast.error(t.cashier.toasts.menuLoadFailed))
      .finally(() => setMenuLoading(false));
  }, [restaurantId, t]);

  // Eagerly load live orders on mount; also poll every 10 s as WebSocket fallback.
  useEffect(() => {
    if (!admin) return;
    fetchLiveOrders();
    const interval = setInterval(() => fetchLiveOrders(true), 10_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin?.restaurant_id]);

  const fetchLiveOrders = useCallback(async (silent = false) => {
    if (!silent) setLiveLoading(true);
    try {
      const res = await cashierGetLiveOrders();
      setLiveOrders(res.data);
    } catch {
      toast.error(t.cashier.toasts.ordersLoadFailed);
    } finally {
      if (!silent) setLiveLoading(false);
    }
  }, [t]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await cashierGetOrderHistory();
      setHistoryOrders(res.data);
    } catch {
      toast.error(t.cashier.toasts.historyLoadFailed);
    } finally {
      setHistoryLoading(false);
    }
  }, [t]);

  const fetchManageItems = useCallback(async () => {
    setManageLoading(true);
    try {
      const res = await cashierGetMenuItems();
      setManageItems(res.data);
    } catch {
      toast.error(t.cashier.toasts.menuItemsLoadFailed);
    } finally {
      setManageLoading(false);
    }
  }, [t]);

  const fetchManageTables = useCallback(async () => {
    if (!admin) return;
    setManageTablesLoading(true);
    try {
      const res = await getTables(admin.restaurant_id);
      setManageTables(res.data);
    } catch {
      toast.error(t.cashier.toasts.tablesLoadFailed);
    } finally {
      setManageTablesLoading(false);
    }
  }, [admin, t]);

  useSocket(
    admin?.restaurant_id ?? null,
    (newOrder) => {
      setLiveOrders((prev) =>
        prev.find((o) => o.id === newOrder.id) ? prev : [newOrder, ...prev],
      );
      if (!newOrder.session_id?.startsWith("cashier-")) {
        playDing();
        toast.info(
          t.cashier.toasts.newOrder(
            newOrder.table?.table_number ?? t.common.takeaway,
          ),
          { position: "top-right", autoClose: 6000, theme: "colored" },
        );
      }
    },
    (updatedOrder) => {
      setLiveOrders((prev) => {
        if (updatedOrder.status === "PAID" || updatedOrder.status === "CANCELLED") {
          return prev.filter((o) => o.id !== updatedOrder.id);
        }
        return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
      });
    },
  );

  const goToLiveOrders = useCallback((order: Order) => {
    setMainTab("activity");
    setActivitySubTab("live");
    // Carry the status along: the refetch below flips the Live tab into its
    // loading state, so it can't look the order up in its own list yet.
    setHighlightOrder({ orderId: order.id, status: order.status, nonce: Date.now() });
    fetchLiveOrders(true);
  }, [fetchLiveOrders]);

  // Clear the highlight prop once the Live tab has played it, so the next
  // unmount/remount of the tab (e.g. switching to history and back) doesn't
  // re-fire the pulse against the stale `highlightOrder` value.
  const handleHighlightConsumed = useCallback(() => setHighlightOrder(null), []);

  const cartItemIds = useMemo(() => new Set(cart.map((c) => c.menuItem.id)), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const pendingOrders = useMemo(() => liveOrders.filter((o) => o.status === "PENDING"), [liveOrders]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { menuItem: item, quantity: 1, note: "" }];
    });
  }, []);

  const changeQty = useCallback((itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.menuItem.id === itemId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const changeNote = useCallback((itemId: string, note: string) => {
    setCart((prev) =>
      prev.map((i) => (i.menuItem.id === itemId ? { ...i, note } : i)),
    );
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItem.id !== itemId));
  }, []);

  const handleCreateOrder = async () => {
    if (!admin) return;
    setCreating(true);
    try {
      const res = await cashierCreateOrder({
        order_type: orderType,
        table_id: orderType === "TABLE" ? selectedTableId : undefined,
        items: cart.map((c) => ({
          menu_item_id: c.menuItem.id,
          quantity: c.quantity,
          special_note: c.note || undefined,
        })),
      });
      if (orderType === "TAKEAWAY") {
        setPendingTakeawayOrder(res.data);
      } else {
        toast.success(t.cashier.toasts.orderPlaced);
      }
      try {
        await cashierPrintKitchen(res.data.id);
      } catch {
        // non-critical
      }
      if (orderType === "TABLE" && selectedTableId) {
        try {
          const tableRes = await cashierOpenTable(selectedTableId);
          const updated = tableRes.data;
          setTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          setManageTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        } catch {
          if (admin) {
            getTables(admin.restaurant_id).then((r) => {
              setTables(r.data);
              setManageTables(r.data);
            });
          }
        }
      }
      setCart([]);
      setSelectedTableId("");
      setMobileOrderOpen(false);
      await fetchLiveOrders();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t.cashier.toasts.orderFailed;
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const closeTakeawayDialog = () => {
    setPendingTakeawayOrder(null);
    setTakeawayPayment("CASH");
  };

  const handleTakeawayPrint = async () => {
    if (!pendingTakeawayOrder) return;
    const order = pendingTakeawayOrder;
    closeTakeawayDialog();
    printBill(order, admin?.restaurant?.name ?? "");
    toast.success(t.cashier.toasts.billPrinted(order.queue_number ?? ""));
    try { await updateOrderStatus(order.id, "PAID"); } catch { /* non-critical */ }
  };

  const initials =
    localAdmin?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "K";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile order panel backdrop */}
      {mobileOrderOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 md:hidden"
          onClick={() => setMobileOrderOpen(false)}
        />
      )}

      <RestaurantProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        admin={localAdmin}
        onSignOut={() => signOut({ callbackUrl: "/login" })}
        onProfileUpdated={(updates) => {
          setLocalAdmin((prev) =>
            prev
              ? {
                  ...prev,
                  restaurant: { ...prev.restaurant, ...updates },
                  ...(updates.name ? {} : {}),
                }
              : prev
          );
        }}
      />

      {/* LEFT — Main content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Tabs
          value={mainTab}
          onValueChange={(v) => {
            setMainTab(v);
            if (v === "activity") fetchLiveOrders();
            if (v === "manage") fetchManageItems();
          }}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <CashierHeader
            admin={localAdmin}
            initials={initials}
            pendingOrders={pendingOrders}
            fetchLiveOrders={fetchLiveOrders}
            onProfileClick={() => setProfileOpen(true)}
            onGoToLiveOrders={goToLiveOrders}
          />

          <TabsContent value="order" className="flex flex-col flex-1 overflow-hidden mt-0">
            <MenuSection
              items={menuItems}
              loading={menuLoading}
              cartItemIds={cartItemIds}
              onAddToCart={addToCart}
            />
          </TabsContent>

          <TabsContent value="activity" className="flex flex-col flex-1 overflow-hidden mt-0">
            <Tabs
              value={activitySubTab}
              onValueChange={(v) => {
                setActivitySubTab(v);
                if (v === "live") fetchLiveOrders();
                if (v === "history") fetchHistory();
              }}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="bg-background border-b px-4 md:px-7 py-2 shrink-0 flex items-center gap-3">
                <TabsList className="h-8 bg-muted/40">
                  <TabsTrigger value="live" className="text-xs font-semibold px-5">{t.cashier.header.subTabLive}</TabsTrigger>
                  <TabsTrigger value="history" className="text-xs font-semibold px-5">{t.cashier.header.subTabHistory}</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="live" className="flex flex-col flex-1 overflow-hidden mt-0">
                <LiveOrdersTab orders={liveOrders} loading={liveLoading} onRefresh={fetchLiveOrders} highlightOrder={highlightOrder} onHighlightConsumed={handleHighlightConsumed} />
              </TabsContent>
              <TabsContent value="history" className="flex flex-col flex-1 overflow-hidden mt-0">
                <OrderHistoryTab orders={historyOrders} loading={historyLoading} onRefresh={fetchHistory} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="manage" className="flex flex-col flex-1 overflow-hidden mt-0">
            <Tabs
              defaultValue="food"
              className="flex flex-col flex-1 overflow-hidden"
              onValueChange={(v) => {
                if (v === "food") fetchManageItems();
                if (v === "table") fetchManageTables();
              }}
            >
              <div className="bg-background border-b px-4 md:px-7 py-2 shrink-0 flex items-center gap-3">
                <TabsList className="h-8 bg-muted/40">
                  <TabsTrigger value="food" className="text-xs font-semibold px-5">{t.cashier.header.subTabFood}</TabsTrigger>
                  <TabsTrigger value="table" className="text-xs font-semibold px-5">{t.cashier.header.subTabTable}</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="food" className="flex flex-col flex-1 overflow-hidden mt-0">
                <MenuManageTab
                  items={manageItems}
                  loading={manageLoading}
                  restaurantId={admin?.restaurant_id ?? ""}
                  onRefresh={fetchManageItems}
                  onItemCreated={(item) => setManageItems((prev) => [item, ...prev])}
                  onItemUpdated={(updated) =>
                    setManageItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
                  }
                  onItemDeleted={(id) => setManageItems((prev) => prev.filter((i) => i.id !== id))}
                />
              </TabsContent>
              <TabsContent value="table" className="flex flex-col flex-1 overflow-hidden mt-0">
                <TableManageTab
                  tables={manageTables}
                  loading={manageTablesLoading}
                  restaurantId={admin?.restaurant_id ?? ""}
                  onRefresh={fetchManageTables}
                  onTableCreated={(t) => {
                    setManageTables((prev) => [t, ...prev]);
                    setTables((prev) => [t, ...prev]);
                  }}
                  onTableUpdated={(updated) => {
                    setManageTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
                    setTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
                  }}
                  onTableDeleted={(id) => {
                    setManageTables((prev) => prev.filter((t) => t.id !== id));
                    setTables((prev) => prev.filter((t) => t.id !== id));
                  }}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT — Order panel */}
      <OrderPanel
        cart={cart}
        tables={tables}
        selectedTableId={selectedTableId}
        orderType={orderType}
        onTableChange={setSelectedTableId}
        onOrderTypeChange={setOrderType}
        onQtyChange={changeQty}
        onNoteChange={changeNote}
        onRemove={removeFromCart}
        onCreateOrder={handleCreateOrder}
        creating={creating}
        mobileOpen={mobileOrderOpen}
        onMobileClose={() => setMobileOrderOpen(false)}
      />

      <MobileCartFab
        cartItemCount={cartItemCount}
        mobileOrderOpen={mobileOrderOpen}
        onOpen={() => setMobileOrderOpen(true)}
      />

      <TakeawayPaymentDialog
        order={pendingTakeawayOrder}
        restaurantName={admin?.restaurant?.name ?? ""}
        payment={takeawayPayment}
        onPaymentChange={setTakeawayPayment}
        onClose={closeTakeawayDialog}
        onPrint={handleTakeawayPrint}
      />
    </div>
  );
}
