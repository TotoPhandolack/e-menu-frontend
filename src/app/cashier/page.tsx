'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { MenuSection } from '@/components/cashier/MenuSection';
import { OrderPanel, type CartItem } from '@/components/cashier/OrderPanel';
import { LiveOrdersTab } from '@/components/cashier/LiveOrdersTab';
import { PaymentModal } from '@/components/cashier/PaymentModal';
import { SplitBillModal } from '@/components/cashier/SplitBillModal';

import { useAuthStore } from '@/stores/auth.store';
import {
  getMenuItems,
  getTables,
  cashierCreateOrder,
  cashierGetLiveOrders,
  cashierGetBill,
  cashierProcessPayment,
  cashierSplitBill,
  cashierPrintReceipt,
  updateOrderStatus,
  type MenuItem,
  type TableInfo,
  type Order,
  type OrderType,
  type OrderStatus,
  type Bill,
  type PaymentMethod,
  type SplitBillEqualResult,
  type SplitBillByItemResult,
} from '@/lib/api';

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CashierPage() {
  const { admin, logout } = useAuthStore();

  // menu & tables
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);

  // cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('TABLE');
  const [creating, setCreating] = useState(false);

  // live orders
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  // payment / split bill
  const [billOrderId, setBillOrderId] = useState<string | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);
  const [billLoading, setBillLoading] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);

  // ── load menu + tables on mount ──────────────────────────────────────────

  useEffect(() => {
    if (!admin) return;
    const rid = admin.restaurant_id;

    setMenuLoading(true);
    Promise.all([getMenuItems(rid), getTables(rid)])
      .then(([menuRes, tableRes]) => {
        setMenuItems(menuRes.data);
        setTables(tableRes.data);
      })
      .catch(() => toast.error('Failed to load menu data'))
      .finally(() => setMenuLoading(false));
  }, [admin]);

  // ── load live orders ──────────────────────────────────────────────────────

  const fetchLiveOrders = useCallback(async () => {
    setLiveLoading(true);
    try {
      const res = await cashierGetLiveOrders();
      setLiveOrders(res.data);
    } catch {
      toast.error('Failed to load active orders');
    } finally {
      setLiveLoading(false);
    }
  }, []);

  // ── cart helpers ──────────────────────────────────────────────────────────

  const cartItemIds = useMemo(() => new Set(cart.map((c) => c.menuItem.id)), [cart]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { menuItem: item, quantity: 1, note: '' }];
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

  // ── create order ──────────────────────────────────────────────────────────

  const handleCreateOrder = async () => {
    if (!admin) return;
    setCreating(true);
    try {
      await cashierCreateOrder({
        order_type: orderType,
        table_id: orderType === 'TABLE' ? selectedTableId : undefined,
        items: cart.map((c) => ({
          menu_item_id: c.menuItem.id,
          quantity: c.quantity,
          special_note: c.note || undefined,
        })),
      });
      toast.success('Order placed successfully!');
      setCart([]);
      setSelectedTableId('');
      await fetchLiveOrders();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to place order';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  // ── open bill ─────────────────────────────────────────────────────────────

  const handleOpenBill = useCallback(async (orderId: string) => {
    setBillOrderId(orderId);
    setBillLoading(true);
    setPaymentOpen(true);
    try {
      const res = await cashierGetBill(orderId);
      setBill(res.data);
    } catch {
      toast.error('Failed to load bill');
      setPaymentOpen(false);
    } finally {
      setBillLoading(false);
    }
  }, []);

  // ── process payment ───────────────────────────────────────────────────────

  const handlePay = useCallback(
    async (method: PaymentMethod, amount: number) => {
      if (!billOrderId) return null;
      try {
        const res = await cashierProcessPayment(billOrderId, method, amount);
        if (res.data.is_fully_paid) {
          toast.success('Payment complete!');
          await fetchLiveOrders();
        } else {
          toast.success(`Payment of ₭${amount.toLocaleString('en-US')} received`);
          const billRes = await cashierGetBill(billOrderId);
          setBill(billRes.data);
        }
        return res.data;
      } catch {
        toast.error('Failed to process payment');
        return null;
      }
    },
    [billOrderId, fetchLiveOrders],
  );

  // ── split bill ────────────────────────────────────────────────────────────

  const handleSplitEqual = useCallback(
    async (parts: number): Promise<SplitBillEqualResult | null> => {
      if (!billOrderId) return null;
      try {
        const res = await cashierSplitBill(billOrderId, { mode: 'equal', number_of_people: parts });
        return res.data as SplitBillEqualResult;
      } catch {
        toast.error('Failed to calculate bill split');
        return null;
      }
    },
    [billOrderId],
  );

  const handleSplitByItem = useCallback(
    async (
      splits: { label: string; item_ids: string[] }[],
    ): Promise<SplitBillByItemResult | null> => {
      if (!billOrderId) return null;
      try {
        const res = await cashierSplitBill(billOrderId, { mode: 'by_item', splits });
        return res.data as SplitBillByItemResult;
      } catch {
        toast.error('Failed to calculate bill split');
        return null;
      }
    },
    [billOrderId],
  );

  // ── update order status ───────────────────────────────────────────────────

  const handleUpdateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      try {
        await updateOrderStatus(orderId, status);
        toast.success('Order status updated');
        await fetchLiveOrders();
      } catch {
        toast.error('Failed to update status');
      }
    },
    [fetchLiveOrders],
  );

  // ── print receipt ─────────────────────────────────────────────────────────

  const handlePrintReceipt = useCallback(async () => {
    if (!billOrderId) return;
    try {
      await cashierPrintReceipt(billOrderId);
      toast.success('Receipt printed successfully');
    } catch {
      toast.error('Failed to print receipt');
    }
  }, [billOrderId]);

  const initials = admin?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'K';

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* ════════════════════════════════════════
          LEFT — Main content area
      ════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Tabs
          defaultValue="order"
          className="flex flex-col flex-1 overflow-hidden"
          onValueChange={(v) => {
            if (v === 'aktifitas') fetchLiveOrders();
          }}
        >
          {/* top header */}
          <div className="bg-background border-b px-7 py-3.5 flex items-center gap-4 shrink-0">
            {/* avatar + name */}
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-sm leading-tight">{admin?.name ?? 'Cashier'}</p>
                <p className="text-xs text-muted-foreground">{admin?.restaurant?.name ?? ''}</p>
              </div>
            </div>

            {/* tabs centered */}
            <div className="flex-1 flex justify-center">
              <TabsList className="h-9 bg-muted/50">
                <TabsTrigger value="order" className="text-sm font-semibold px-6">
                  Order
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-sm font-semibold px-6">
                  Activity
                </TabsTrigger>
              </TabsList>
            </div>

            {/* logout */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-destructive"
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
            >
              <LogOut size={15} strokeWidth={2} />
              Sign Out
            </Button>
          </div>

          {/* ── Pesan tab ── */}
          <TabsContent value="order" className="flex-1 overflow-hidden mt-0">
            <MenuSection
              items={menuItems}
              loading={menuLoading}
              cartItemIds={cartItemIds}
              onAddToCart={addToCart}
            />
          </TabsContent>

          {/* ── Aktifitas tab ── */}
          <TabsContent value="activity" className="flex-1 overflow-hidden mt-0">
            <LiveOrdersTab
              orders={liveOrders}
              loading={liveLoading}
              onRefresh={fetchLiveOrders}
              onOpenBill={handleOpenBill}
              onUpdateStatus={handleUpdateStatus}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* ════════════════════════════════════════
          RIGHT — Order panel
      ════════════════════════════════════════ */}
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
        onOpenBill={handleOpenBill}
        creating={creating}
      />

      {/* ════════════════════════════════════════
          Modals
      ════════════════════════════════════════ */}
      <PaymentModal
        open={paymentOpen}
        bill={bill}
        loading={billLoading}
        onClose={() => {
          setPaymentOpen(false);
          setBill(null);
          setBillOrderId(null);
        }}
        onPay={handlePay}
        onOpenSplitBill={() => setSplitOpen(true)}
        onPrintReceipt={handlePrintReceipt}
      />

      <SplitBillModal
        open={splitOpen}
        bill={bill}
        onClose={() => setSplitOpen(false)}
        onSplitEqual={handleSplitEqual}
        onSplitByItem={handleSplitByItem}
      />
    </div>
  );
}
