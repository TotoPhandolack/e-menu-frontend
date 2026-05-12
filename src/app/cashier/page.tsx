'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { MenuSection } from '@/components/cashier/MenuSection';
import { MenuManageTab } from '@/components/cashier/MenuManageTab';
import { OrderPanel, type CartItem } from '@/components/cashier/OrderPanel';
import { LiveOrdersTab } from '@/components/cashier/LiveOrdersTab';

import { useAuthStore } from '@/stores/auth.store';
import {
  getMenuItems,
  cashierGetMenuItems,
  getTables,
  cashierCreateOrder,
  cashierGetLiveOrders,
  cashierPrintKitchen,
  type MenuItem,
  type TableInfo,
  type Order,
  type OrderType,
} from '@/lib/api';

export default function CashierPage() {
  const { admin, logout } = useAuthStore();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('TABLE');
  const [creating, setCreating] = useState(false);

  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  const [manageItems, setManageItems] = useState<MenuItem[]>([]);
  const [manageLoading, setManageLoading] = useState(false);

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

  const fetchManageItems = useCallback(async () => {
    setManageLoading(true);
    try {
      const res = await cashierGetMenuItems();
      setManageItems(res.data);
    } catch {
      toast.error('Failed to load menu items');
    } finally {
      setManageLoading(false);
    }
  }, []);

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

  const handleCreateOrder = async () => {
    if (!admin) return;
    setCreating(true);
    try {
      const res = await cashierCreateOrder({
        order_type: orderType,
        table_id: orderType === 'TABLE' ? selectedTableId : undefined,
        items: cart.map((c) => ({
          menu_item_id: c.menuItem.id,
          quantity: c.quantity,
          special_note: c.note || undefined,
        })),
      });
      toast.success('Order placed!');
      // Auto-send kitchen ticket immediately
      try {
        await cashierPrintKitchen(res.data.id);
      } catch {
        // non-critical, don't block
      }
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

  const initials = admin?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'K';

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* LEFT — Main content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Tabs
          defaultValue="order"
          className="flex flex-col flex-1 overflow-hidden"
          onValueChange={(v) => {
            if (v === 'activity') fetchLiveOrders();
            if (v === 'manage') fetchManageItems();
          }}
        >
          {/* header */}
          <div className="bg-background border-b px-7 py-3.5 flex items-center gap-4 shrink-0">
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

            <div className="flex-1 flex justify-center">
              <TabsList className="h-9 bg-muted/50">
                <TabsTrigger value="order" className="text-sm font-semibold px-6">
                  Order
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-sm font-semibold px-6">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="manage" className="text-sm font-semibold px-6">
                  Manage
                </TabsTrigger>
              </TabsList>
            </div>

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

          <TabsContent value="order" className="flex flex-col flex-1 overflow-hidden mt-0">
            <MenuSection
              items={menuItems}
              loading={menuLoading}
              cartItemIds={cartItemIds}
              onAddToCart={addToCart}
            />
          </TabsContent>

          <TabsContent value="activity" className="flex-1 overflow-hidden mt-0">
            <LiveOrdersTab
              orders={liveOrders}
              loading={liveLoading}
              onRefresh={fetchLiveOrders}
            />
          </TabsContent>

          <TabsContent value="manage" className="flex flex-col flex-1 overflow-hidden mt-0">
            <MenuManageTab
              items={manageItems}
              loading={manageLoading}
              restaurantId={admin?.restaurant_id ?? ''}
              onRefresh={fetchManageItems}
              onItemCreated={(item) => setManageItems((prev) => [item, ...prev])}
              onItemUpdated={(updated) =>
                setManageItems((prev) =>
                  prev.map((i) => (i.id === updated.id ? updated : i)),
                )
              }
              onItemDeleted={(id) =>
                setManageItems((prev) => prev.filter((i) => i.id !== id))
              }
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT — Order panel: always fixed on the right */}
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
      />
    </div>
  );
}
