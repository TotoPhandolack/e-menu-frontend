'use client';

import { useState } from 'react';
import { RefreshCw, ClipboardList, Clock, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { updateOrderStatus, cashierPrintKitchen, type Order } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { printBill } from '@/lib/printBill';

interface Props {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function formatKip(n: number | string) {
  return `₭${Number(n).toLocaleString('en-US')}`;
}

// ─── Individual order card with actions ──────────────────────────────────────

function PendingCard({ order, onDone }: { order: Order; onDone: () => void }) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await updateOrderStatus(order.id, 'CONFIRMED');
      // Fire kitchen print — non-critical, don't block on failure
      cashierPrintKitchen(order.id).catch(() => null);
      toast.success(`ຢືນຢັນ Order ໂຕະ ${order.table?.table_number ?? 'Takeaway'} ແລ້ວ`);
      onDone();
    } catch {
      toast.error('Failed to confirm order');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      await updateOrderStatus(order.id, 'CANCELLED');
      toast.success('Order cancelled');
      onDone();
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-yellow-300 p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-slate-800">
            {order.order_type === 'TAKEAWAY'
              ? `Takeaway #${order.queue_number}`
              : `ໂຕະ ${order.table?.table_number ?? '-'}`}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {timeAgo(order.created_at)}
          </p>
        </div>
        <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
          PENDING
        </span>
      </div>

      <div className="space-y-1 border-t pt-2">
        {order.orderItems.map((oi) => (
          <div key={oi.id} className="text-[12px] text-slate-700">
            <span className="font-medium">{oi.quantity}× {oi.menuItem.name}</span>
            {oi.special_note && (
              <span className="ml-1 text-orange-500 italic">({oi.special_note})</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground border-t pt-2">
        <span>Total</span>
        <span className="font-semibold text-slate-800">{formatKip(order.total_amount)}</span>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
          disabled={busy}
          onClick={handleConfirm}
        >
          ✓ ຢືນຢັນ & ສົ່ງຄົວ
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-500 border-red-200 hover:bg-red-50 text-xs h-8"
          disabled={busy}
          onClick={handleCancel}
        >
          ຍົກເລີກ
        </Button>
      </div>
    </div>
  );
}

function ConfirmedCard({ order, onDone, restaurantName }: { order: Order; onDone: () => void; restaurantName: string }) {
  const [busy, setBusy] = useState(false);

  const handlePaid = async () => {
    setBusy(true);
    try {
      await updateOrderStatus(order.id, 'PAID');
      toast.success(`Order ຮັບເງິນແລ້ວ`);
      printBill(order, restaurantName);
      onDone();
    } catch {
      toast.error('Failed to mark as paid');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      await updateOrderStatus(order.id, 'CANCELLED');
      toast.success('Order cancelled');
      onDone();
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-300 p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-slate-800">
            {order.order_type === 'TAKEAWAY'
              ? `Takeaway #${order.queue_number}`
              : `ໂຕະ ${order.table?.table_number ?? '-'}`}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {timeAgo(order.created_at)}
          </p>
        </div>
        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
          IN KITCHEN
        </span>
      </div>

      <div className="space-y-1 border-t pt-2">
        {order.orderItems.map((oi) => (
          <div key={oi.id} className="text-[12px] text-slate-700">
            <span className="font-medium">{oi.quantity}× {oi.menuItem.name}</span>
            {oi.special_note && (
              <span className="ml-1 text-orange-500 italic">({oi.special_note})</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground border-t pt-2">
        <span>Total</span>
        <span className="font-semibold text-slate-800">{formatKip(order.total_amount)}</span>
      </div>

      <div className="flex gap-2 mt-1">
        <Button
          size="sm"
          className="flex-1 bg-slate-800 hover:bg-slate-900 text-white text-xs h-8"
          disabled={busy}
          onClick={handlePaid}
        >
          ຮັບເງິນ / Mark Paid
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-500 border-red-200 hover:bg-red-50 text-xs h-8"
          disabled={busy}
          onClick={handleCancel}
        >
          ຍົກເລີກ
        </Button>
      </div>
    </div>
  );
}

// ─── Main tab component ───────────────────────────────────────────────────────

export function LiveOrdersTab({ orders, loading, onRefresh }: Props) {
  const restaurantName = useAuthStore((s) => s.admin?.restaurant?.name ?? '');

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    );
  }

  const pending = orders.filter((o) => o.status === 'PENDING');
  const confirmed = orders.filter((o) => o.status === 'CONFIRMED');

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="px-7 py-3.5 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {pending.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full">
              <Clock size={11} />
              {pending.length} ລໍຖ້າຢືນຢັນ
            </span>
          )}
          {confirmed.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
              <ChefHat size={11} />
              {confirmed.length} ໃນຄົວ
            </span>
          )}
          {orders.length === 0 && (
            <p className="text-sm text-muted-foreground">No active orders</p>
          )}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={onRefresh}>
          <RefreshCw size={13} strokeWidth={2} />
          Refresh
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-7 space-y-8">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 text-muted-foreground gap-3">
              <ClipboardList size={44} strokeWidth={1.2} />
              <p className="text-sm">ບໍ່ມີ order ທີ່ active</p>
            </div>
          ) : (
            <>
              {/* ── PENDING section ── */}
              {pending.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-600 mb-3">
                    ລໍຖ້າການຢືນຢັນ
                  </h3>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                    {pending.map((order) => (
                      <PendingCard key={order.id} order={order} onDone={onRefresh} />
                    ))}
                  </div>
                </section>
              )}

              {/* ── CONFIRMED section ── */}
              {confirmed.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
                    ໃນຄົວ — ລໍຖ້າຮັບເງິນ
                  </h3>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                    {confirmed.map((order) => (
                      <ConfirmedCard key={order.id} order={order} onDone={onRefresh} restaurantName={restaurantName} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
