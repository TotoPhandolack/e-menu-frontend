'use client';

import { useState } from 'react';
import { RefreshCw, ClipboardList, Clock, ChefHat, Banknote, QrCode, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "react-toastify";
import { updateOrderStatus, cashierPrintKitchen, type Order } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { printBill } from '@/lib/printBill';
import { BillReceipt } from '@/components/billReceipt';
import { useTranslations, type Translations } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface Props {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
}

function timeAgo(dateStr: string, t: Translations) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t.cashier.time.justNow;
  if (mins < 60) return t.cashier.time.minutesAgo(mins);
  return t.cashier.time.hoursAgo(Math.floor(mins / 60));
}

function formatKip(n: number | string) {
  return `₭${Number(n).toLocaleString('en-US')}`;
}

// ─── Individual order card with actions ──────────────────────────────────────

function PendingCard({ order, onDone }: { order: Order; onDone: () => void }) {
  const t = useTranslations();
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await updateOrderStatus(order.id, 'CONFIRMED');
      // Fire kitchen print — non-critical, don't block on failure
      cashierPrintKitchen(order.id).catch(() => null);
      toast.success(t.cashier.live.orderConfirmed(order.table?.table_number ?? t.common.takeaway));
      onDone();
    } catch {
      toast.error(t.cashier.live.confirmFailed);
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      await updateOrderStatus(order.id, 'CANCELLED');
      toast.success(t.cashier.live.orderCancelled);
      onDone();
    } catch {
      toast.error(t.cashier.live.cancelFailed);
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
              ? `${t.common.takeaway} #${order.queue_number}`
              : t.cashier.order.tableLabel(order.table?.table_number ?? '-')}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {timeAgo(order.created_at, t)}
          </p>
        </div>
        <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {t.cashier.live.pending}
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
        <span>{t.cashier.live.total}</span>
        <span className="font-semibold text-slate-800">{formatKip(order.total_amount)}</span>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
          disabled={busy}
          onClick={handleConfirm}
        >
          {t.cashier.live.confirmAndSend}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-500 border-red-200 hover:bg-red-50 text-xs h-8"
          disabled={busy}
          onClick={handleCancel}
        >
          {t.common.cancel}
        </Button>
      </div>
    </div>
  );
}

function ConfirmedCard({
  order,
  onDone,
}: {
  order: Order;
  onDone: () => void;
}) {
  const t = useTranslations();
  const { data: session } = useSession();
  const restaurantName = session?.admin?.restaurant?.name ?? '';
  const [busy, setBusy] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'CASH' | 'QR' | null>(null);
  const [printDialog, setPrintDialog] = useState(false);

  const handlePrint = async () => {
    setPrintDialog(false);
    setBusy(true);
    try {
      await updateOrderStatus(order.id, 'PAID');
      toast.success(t.cashier.live.orderPaid);
      printBill(order, restaurantName);
      onDone(); // refresh parent — card unmounts after this
    } catch {
      toast.error(t.cashier.live.markPaidFailed);
      setBusy(false);
    }
  };

  const handleSkipPrint = () => {
    setPrintDialog(false);
    // no API call, no refresh — order stays CONFIRMED
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      await updateOrderStatus(order.id, 'CANCELLED');
      toast.success(t.cashier.live.orderCancelled);
      onDone();
    } catch {
      toast.error(t.cashier.live.cancelFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border-2 border-blue-300 p-4 space-y-3 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-sm text-slate-800">
              {order.order_type === 'TAKEAWAY'
                ? `${t.common.takeaway} #${order.queue_number}`
                : t.cashier.order.tableLabel(order.table?.table_number ?? '-')}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {timeAgo(order.created_at, t)}
            </p>
          </div>
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {t.cashier.live.inKitchen}
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
          <span>{t.cashier.live.total}</span>
          <span className="font-semibold text-slate-800">{formatKip(order.total_amount)}</span>
        </div>

        <div className="flex gap-2 mt-1">
          <Button
            size="sm"
            className="flex-1 bg-slate-800 hover:bg-slate-900 text-white text-xs h-8"
            disabled={busy}
            onClick={() => { setSelectedMethod(null); setPaymentDialog(true); }}
          >
            {t.cashier.live.markPaid}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50 text-xs h-8"
            disabled={busy}
            onClick={handleCancel}
          >
            {t.common.cancel}
          </Button>
        </div>
      </div>

      {/* Step 1 — Payment method */}
      <Dialog
        open={paymentDialog}
        onOpenChange={(open) => { if (!open) { setSelectedMethod(null); setPaymentDialog(false); } }}
      >
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>{t.cashier.live.paymentMethod}</DialogTitle>
            <DialogDescription>{t.cashier.live.paymentMethodQuestion}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-1">
            <button
              onClick={() => setSelectedMethod('CASH')}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-colors ${
                selectedMethod === 'CASH'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'
              }`}
            >
              <Banknote size={28} className="text-emerald-600" />
              <span className="font-semibold text-sm">{t.cashier.live.cash}</span>
            </button>
            <button
              onClick={() => setSelectedMethod('QR')}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-colors ${
                selectedMethod === 'QR'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <QrCode size={28} className="text-blue-600" />
              <span className="font-semibold text-sm">{t.cashier.live.qrCode}</span>
            </button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setSelectedMethod(null); setPaymentDialog(false); }}
            >
              {t.common.cancel}
            </Button>
            <Button
              disabled={!selectedMethod}
              onClick={() => { setPaymentDialog(false); setPrintDialog(true); }}
            >
              {t.common.yes}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step 2 — Print receipt */}
      <Dialog open={printDialog} onOpenChange={(open) => { if (!open) handleSkipPrint(); }}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.cashier.live.printBillQuestion}</DialogTitle>
            <DialogDescription>
              {t.cashier.live.printBillPrompt}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[54vh] overflow-y-auto rounded-xl bg-muted/40 p-4">
            <BillReceipt order={order} restaurantName={restaurantName} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSkipPrint}>
              {t.common.cancel}
            </Button>
            <Button onClick={handlePrint} className="gap-1.5" disabled={busy}>
              <Printer size={15} />
              {t.common.print}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Main tab component ───────────────────────────────────────────────────────

export function LiveOrdersTab({ orders, loading, onRefresh }: Props) {
  const t = useTranslations();
  if (loading) {
    return (
      <div className="p-6 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    );
  }

  const pending = orders.filter((o) => o.status === 'PENDING' && o.order_type !== 'TAKEAWAY');
  const confirmed = orders.filter((o) => o.status === 'CONFIRMED' && o.order_type !== 'TAKEAWAY');

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="px-7 py-3.5 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {pending.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full">
              <Clock size={11} />
              {t.cashier.live.waitingCount(pending.length)}
            </span>
          )}
          {confirmed.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
              <ChefHat size={11} />
              {t.cashier.live.inKitchenCount(confirmed.length)}
            </span>
          )}
          {orders.length === 0 && (
            <p className="text-sm text-muted-foreground">{t.cashier.live.noActiveOrdersShort}</p>
          )}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={onRefresh}>
          <RefreshCw size={13} strokeWidth={2} />
          {t.common.refresh}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-7 space-y-8">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 text-muted-foreground gap-3">
              <ClipboardList size={44} strokeWidth={1.2} />
              <p className="text-sm">{t.cashier.live.noActiveOrders}</p>
            </div>
          ) : (
            <>
              {/* ── PENDING section ── */}
              {pending.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-600 mb-3">
                    {t.cashier.live.pendingSection}
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
                    {t.cashier.live.confirmedSection}
                  </h3>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                    {confirmed.map((order) => (
                      <ConfirmedCard
                        key={order.id}
                        order={order}
                        onDone={onRefresh}
                      />
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
