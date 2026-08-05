'use client';

import { useState } from 'react';
import { RefreshCw, ClipboardList, Clock, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from "react-toastify";
import { updateOrderStatus, cashierPrintKitchen, type Order } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { printBill } from '@/lib/printBill';
import { useTranslations, type Translations } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { PaymentDialog } from './paymentDialog';

interface Props {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
}

// Vertical rule between columns — the shared Table primitive only draws row borders.
const COL_DIVIDER = '[&>*:not(:last-child)]:border-r';

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

function orderLabel(order: Order, t: Translations) {
  return order.order_type === 'TAKEAWAY'
    ? `${t.common.takeaway} #${order.queue_number}`
    : t.cashier.order.tableLabel(order.table?.table_number ?? '-');
}

function ItemsCell({ order }: { order: Order }) {
  return (
    <div className="space-y-1">
      {order.orderItems.map((oi) => (
        <div key={oi.id} className="text-[12px] text-foreground">
          <span className="font-medium">{oi.quantity}× {oi.menuItem.name}</span>
          {oi.special_note && (
            <span className="ml-1 text-status-preparing-foreground italic">({oi.special_note})</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Table rows with actions ──────────────────────────────────────────────────

function PendingRow({ order, onDone }: { order: Order; onDone: () => void }) {
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
    <TableRow className={COL_DIVIDER}>
      <TableCell className="align-top font-semibold text-foreground">
        {orderLabel(order, t)}
      </TableCell>
      <TableCell className="align-top">
        <ItemsCell order={order} />
      </TableCell>
      <TableCell className="align-top text-xs text-muted-foreground whitespace-nowrap">
        {timeAgo(order.created_at, t)}
      </TableCell>
      <TableCell className="align-top text-right font-semibold text-foreground whitespace-nowrap">
        {formatKip(order.total_amount)}
      </TableCell>
      <TableCell className="align-top">
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-status-complete-foreground hover:bg-status-complete-foreground text-white text-xs h-8"
            disabled={busy}
            onClick={handleConfirm}
          >
            {t.cashier.live.confirmAndSend}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs h-8"
            disabled={busy}
            onClick={handleCancel}
          >
            {t.common.cancel}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ConfirmedRow({ order, onDone }: { order: Order; onDone: () => void }) {
  const t = useTranslations();
  const { data: session } = useSession();
  const restaurantName = session?.admin?.restaurant?.name ?? '';
  const [busy, setBusy] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'CASH' | 'QR'>('CASH');

  const handlePrint = async () => {
    setBusy(true);
    try {
      await updateOrderStatus(order.id, 'PAID');
      setPaymentDialog(false);
      toast.success(t.cashier.live.orderPaid);
      printBill(order, restaurantName);
      onDone(); // refresh parent — row unmounts after this
    } catch {
      toast.error(t.cashier.live.markPaidFailed);
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
    <>
      <TableRow className={COL_DIVIDER}>
        <TableCell className="align-top font-semibold text-foreground">
          {orderLabel(order, t)}
        </TableCell>
        <TableCell className="align-top">
          <ItemsCell order={order} />
        </TableCell>
        <TableCell className="align-top text-xs text-muted-foreground whitespace-nowrap">
          {timeAgo(order.created_at, t)}
        </TableCell>
        <TableCell className="align-top text-right font-semibold text-foreground whitespace-nowrap">
          {formatKip(order.total_amount)}
        </TableCell>
        <TableCell className="align-top">
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-foreground hover:bg-foreground text-white text-xs h-8"
              disabled={busy}
              onClick={() => { setSelectedMethod('CASH'); setPaymentDialog(true); }}
            >
              {t.cashier.live.markPaid}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs h-8"
              disabled={busy}
              onClick={handleCancel}
            >
              {t.common.cancel}
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <PaymentDialog
        open={paymentDialog}
        order={order}
        restaurantName={restaurantName}
        subtitle={t.cashier.order.tableLabel(order.table?.table_number ?? '-')}
        payment={selectedMethod}
        onPaymentChange={setSelectedMethod}
        onClose={() => setPaymentDialog(false)}
        onPrint={handlePrint}
        printing={busy}
      />
    </>
  );
}

// ─── Main tab component ───────────────────────────────────────────────────────

export function LiveOrdersTab({ orders, loading, onRefresh }: Props) {
  const t = useTranslations();
  if (loading) {
    return (
      <div className="p-6 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
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
            <span className="flex items-center gap-1.5 text-xs font-semibold text-status-preparing-foreground bg-status-preparing px-2.5 py-1 rounded-full">
              <Clock size={11} />
              {t.cashier.live.waitingCount(pending.length)}
            </span>
          )}
          {confirmed.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-status-confirmed-foreground bg-status-confirmed px-2.5 py-1 rounded-full">
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
                  <h3 className="text-xs font-bold uppercase tracking-widest text-status-preparing-foreground mb-3">
                    {t.cashier.live.pendingSection}
                  </h3>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className={cn("hover:bg-transparent", COL_DIVIDER)}>
                          <TableHead>{t.cashier.live.colOrder}</TableHead>
                          <TableHead>{t.cashier.live.colItems}</TableHead>
                          <TableHead>{t.cashier.live.colTime}</TableHead>
                          <TableHead className="text-right">{t.cashier.live.colTotal}</TableHead>
                          <TableHead>{t.cashier.live.colActions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pending.map((order) => (
                          <PendingRow key={order.id} order={order} onDone={onRefresh} />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </section>
              )}

              {/* ── CONFIRMED section ── */}
              {confirmed.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-status-confirmed-foreground mb-3">
                    {t.cashier.live.confirmedSection}
                  </h3>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className={cn("hover:bg-transparent", COL_DIVIDER)}>
                          <TableHead>{t.cashier.live.colOrder}</TableHead>
                          <TableHead>{t.cashier.live.colItems}</TableHead>
                          <TableHead>{t.cashier.live.colTime}</TableHead>
                          <TableHead className="text-right">{t.cashier.live.colTotal}</TableHead>
                          <TableHead>{t.cashier.live.colActions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {confirmed.map((order) => (
                          <ConfirmedRow
                            key={order.id}
                            order={order}
                            onDone={onRefresh}
                          />
                        ))}
                      </TableBody>
                    </Table>
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
