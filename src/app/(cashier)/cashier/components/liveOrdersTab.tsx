'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Clock, ChefHat, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  highlightOrder?: { orderId: string; nonce: number } | null;
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

function CountBadge({ n, tone }: { n: number; tone: 'pending' | 'confirmed' }) {
  const toneClasses =
    tone === 'pending'
      ? 'bg-status-preparing text-status-preparing-foreground'
      : 'bg-status-confirmed text-status-confirmed-foreground';
  return (
    <span className="relative inline-flex">
      {n > 0 && (
        <span className={cn('absolute inset-0 rounded-full opacity-75 animate-ping', toneClasses)} />
      )}
      <span
        className={cn(
          'relative inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold',
          n > 0 ? toneClasses : 'bg-muted text-muted-foreground',
        )}
      >
        {n}
      </span>
    </span>
  );
}

function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-56 text-muted-foreground gap-3">
      <Icon size={44} strokeWidth={1.2} />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function ColumnHeaderRow({ t }: { t: Translations }) {
  return (
    <TableHeader>
      <TableRow className={cn('hover:bg-transparent', COL_DIVIDER)}>
        <TableHead>{t.cashier.live.colOrder}</TableHead>
        <TableHead>{t.cashier.live.colItems}</TableHead>
        <TableHead>{t.cashier.live.colTime}</TableHead>
        <TableHead>{t.cashier.live.colTotal}</TableHead>
        <TableHead>{t.cashier.live.colActions}</TableHead>
      </TableRow>
    </TableHeader>
  );
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

function PendingRow({ order, onDone, highlighted }: { order: Order; onDone: () => void; highlighted: boolean }) {
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
    <TableRow
      id={`live-order-${order.id}`}
      className={cn(COL_DIVIDER, highlighted && 'animate-row-highlight')}
    >
      <TableCell className="align-top font-semibold text-foreground">
        {orderLabel(order, t)}
      </TableCell>
      <TableCell className="align-top">
        <ItemsCell order={order} />
      </TableCell>
      <TableCell className="align-top text-xs text-muted-foreground whitespace-nowrap">
        {timeAgo(order.created_at, t)}
      </TableCell>
      <TableCell className="align-top font-semibold text-foreground whitespace-nowrap">
        {formatKip(order.total_amount)}
      </TableCell>
      <TableCell className="align-top">
        <div className="flex justify-center gap-2">
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

function ConfirmedRow({ order, onDone, highlighted }: { order: Order; onDone: () => void; highlighted: boolean }) {
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
      <TableRow
        id={`live-order-${order.id}`}
        className={cn(COL_DIVIDER, highlighted && 'animate-row-highlight')}
      >
        <TableCell className="align-top font-semibold text-foreground">
          {orderLabel(order, t)}
        </TableCell>
        <TableCell className="align-top">
          <ItemsCell order={order} />
        </TableCell>
        <TableCell className="align-top text-xs text-muted-foreground whitespace-nowrap">
          {timeAgo(order.created_at, t)}
        </TableCell>
        <TableCell className="align-top font-semibold text-foreground whitespace-nowrap">
          {formatKip(order.total_amount)}
        </TableCell>
        <TableCell className="align-top">
          <div className="flex justify-center gap-2">
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

export function LiveOrdersTab({ orders, loading, onRefresh, highlightOrder }: Props) {
  const t = useTranslations();
  const [statusTab, setStatusTab] = useState<'pending' | 'confirmed'>('pending');
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  // Derive the tab-switch + highlight target during render when a new
  // notification is clicked — React's documented pattern for state that's
  // derived from a prop, instead of bouncing through an effect for it.
  // Seeded with `null` (not `highlightOrder`) so this still fires the first
  // time this component mounts with a highlight already pending — the Live
  // tab's content unmounts whenever the cashier navigates away from it, so a
  // fresh mount is the common case right after clicking a notification.
  const [lastHighlightToken, setLastHighlightToken] = useState<typeof highlightOrder>(null);
  if (highlightOrder !== lastHighlightToken) {
    setLastHighlightToken(highlightOrder);
    const target = highlightOrder ? orders.find((o) => o.id === highlightOrder.orderId) : undefined;
    if (target) {
      setStatusTab(target.status === 'CONFIRMED' ? 'confirmed' : 'pending');
      setActiveHighlight(target.id);
    }
  }

  // Scroll the highlighted row into view and auto-clear the highlight after a beat.
  useEffect(() => {
    if (!activeHighlight) return;
    const raf = requestAnimationFrame(() => {
      document
        .getElementById(`live-order-${activeHighlight}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const timer = setTimeout(() => setActiveHighlight(null), 2500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [activeHighlight]);

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
      {orders.length === 0 ? (
        <div className="flex-1 overflow-hidden">
          <EmptyState icon={ClipboardList} text={t.cashier.live.noActiveOrders} />
        </div>
      ) : (
        <Tabs
          value={statusTab}
          onValueChange={(v) => setStatusTab(v as 'pending' | 'confirmed')}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="px-7 pt-4 shrink-0">
            <TabsList className="h-9 bg-muted/50">
              <TabsTrigger value="pending" className="gap-2 text-xs font-semibold px-4">
                {t.cashier.live.pendingSection}
                <CountBadge n={pending.length} tone="pending" />
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="gap-2 text-xs font-semibold px-4">
                {t.cashier.live.confirmedSection}
                <CountBadge n={confirmed.length} tone="confirmed" />
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── PENDING tab ── */}
          <TabsContent value="pending" className="flex flex-col flex-1 overflow-hidden mt-0">
            <ScrollArea className="flex-1">
              <div className="p-7">
                {pending.length === 0 ? (
                  <EmptyState icon={Clock} text={t.cashier.live.noPending} />
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <ColumnHeaderRow t={t} />
                      <TableBody>
                        {pending.map((order) => (
                          <PendingRow
                            key={order.id}
                            order={order}
                            onDone={onRefresh}
                            highlighted={order.id === activeHighlight}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── CONFIRMED tab ── */}
          <TabsContent value="confirmed" className="flex flex-col flex-1 overflow-hidden mt-0">
            <ScrollArea className="flex-1">
              <div className="p-7">
                {confirmed.length === 0 ? (
                  <EmptyState icon={ChefHat} text={t.cashier.live.noConfirmed} />
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <ColumnHeaderRow t={t} />
                      <TableBody>
                        {confirmed.map((order) => (
                          <ConfirmedRow
                            key={order.id}
                            order={order}
                            onDone={onRefresh}
                            highlighted={order.id === activeHighlight}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
