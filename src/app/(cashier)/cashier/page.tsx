"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { toast as rtToast, ToastContainer } from "react-toastify";
import { playDing } from "@/lib/sound";
import { printBill } from "@/lib/printBill";

import { CashierHeader } from "@/components/cashier/CashierHeader";
import { TakeawayPaymentDialog } from "@/components/cashier/TakeawayPaymentDialog";
import { MobileCartFab } from "@/components/cashier/MobileCartFab";
import { MenuSection } from "@/components/cashier/MenuSection";
import { MenuManageTab } from "@/components/cashier/MenuManageTab";
import { TableManageTab } from "@/components/cashier/TableManageTab";
import { OrderPanel, type CartItem } from "@/components/cashier/OrderPanel";
import { LiveOrdersTab } from "@/components/cashier/LiveOrdersTab";
import { OrderHistoryTab } from "@/components/cashier/OrderHistoryTab";

import { useAuthStore } from "@/stores/auth.store";
import { useSocket } from "@/hooks/useSocket";
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
  type OrderType,
} from "@/lib/api";

export default function CashierPage() {
  const { admin, logout } = useAuthStore();

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

  useEffect(() => {
    if (!admin) return;
    const rid = admin.restaurant_id;
    setMenuLoading(true);
    Promise.all([getMenuItems(rid), getTables(rid)])
      .then(([menuRes, tableRes]) => {
        setMenuItems(menuRes.data);
        setTables(tableRes.data);
      })
      .catch(() => toast.error("Failed to load menu data"))
      .finally(() => setMenuLoading(false));
  }, [admin]);

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
      toast.error("Failed to load active orders");
    } finally {
      if (!silent) setLiveLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await cashierGetOrderHistory();
      setHistoryOrders(res.data);
    } catch {
      toast.error("Failed to load order history");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const fetchManageItems = useCallback(async () => {
    setManageLoading(true);
    try {
      const res = await cashierGetMenuItems();
      setManageItems(res.data);
    } catch {
      toast.error("Failed to load menu items");
    } finally {
      setManageLoading(false);
    }
  }, []);

  const fetchManageTables = useCallback(async () => {
    if (!admin) return;
    setManageTablesLoading(true);
    try {
      const res = await getTables(admin.restaurant_id);
      setManageTables(res.data);
    } catch {
      toast.error("Failed to load tables");
    } finally {
      setManageTablesLoading(false);
    }
  }, [admin]);

  useSocket(
    admin?.restaurant_id ?? null,
    (newOrder) => {
      setLiveOrders((prev) =>
        prev.find((o) => o.id === newOrder.id) ? prev : [newOrder, ...prev],
      );
      if (!newOrder.session_id?.startsWith("cashier-")) {
        playDing();
        rtToast.info(
          `🔔 Order ໃໝ່! ໂຕະ ${newOrder.table?.table_number ?? "Takeaway"}`,
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
        toast.success("Order placed!");
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
          ?.message ?? "Failed to place order";
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
    toast.success(`ພິມໃບບິນສຳເລັດ! / Bill printed — #${order.queue_number}`);
    try { await updateOrderStatus(order.id, "PAID"); } catch { /* non-critical */ }
  };

  const initials =
    admin?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "K";

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Mobile order panel backdrop */}
      {mobileOrderOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOrderOpen(false)}
        />
      )}

      {/* LEFT — Main content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Tabs
          defaultValue="order"
          className="flex flex-col flex-1 overflow-hidden"
          onValueChange={(v) => {
            if (v === "activity") fetchLiveOrders();
            if (v === "manage") fetchManageItems();
          }}
        >
          <CashierHeader
            admin={admin}
            initials={initials}
            pendingOrders={pendingOrders}
            onSignOut={() => { logout(); window.location.href = "/login"; }}
            fetchLiveOrders={fetchLiveOrders}
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
              defaultValue="live"
              className="flex flex-col flex-1 overflow-hidden"
              onValueChange={(v) => {
                if (v === "live") fetchLiveOrders();
                if (v === "history") fetchHistory();
              }}
            >
              <div className="bg-background border-b px-4 md:px-7 py-2 shrink-0 flex items-center gap-3">
                <TabsList className="h-8 bg-muted/40">
                  <TabsTrigger value="live" className="text-xs font-semibold px-5">Live</TabsTrigger>
                  <TabsTrigger value="history" className="text-xs font-semibold px-5">History</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="live" className="flex-1 overflow-hidden mt-0">
                <LiveOrdersTab orders={liveOrders} loading={liveLoading} onRefresh={fetchLiveOrders} />
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
                  <TabsTrigger value="food" className="text-xs font-semibold px-5">Food</TabsTrigger>
                  <TabsTrigger value="table" className="text-xs font-semibold px-5">Table</TabsTrigger>
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

      <ToastContainer limit={5} />

      <TakeawayPaymentDialog
        order={pendingTakeawayOrder}
        payment={takeawayPayment}
        onPaymentChange={setTakeawayPayment}
        onClose={closeTakeawayDialog}
        onPrint={handleTakeawayPrint}
      />
    </div>
  );
}
