// src/app/(customer)/menu/components/orderListSheet.tsx
"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ClipboardList, RefreshCw, X, Clock, ChefHat } from "lucide-react";
import { cancelOrder, type Order } from "@/lib/api";
import { toast } from "react-toastify";
import { useTranslations } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  onOrderCancelled: (orderId: string) => void;
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const t = useTranslations();
  if (status === "PENDING")
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-preparing text-status-preparing-foreground">
        <Clock size={9} />
        {t.customer.orders.pending}
      </span>
    );
  if (status === "CONFIRMED")
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-confirmed text-status-confirmed-foreground">
        <ChefHat size={9} />
        {t.customer.orders.inKitchen}
      </span>
    );
  return null;
}

function OrderRow({
  order,
  onCancelled,
}: {
  order: Order;
  onCancelled: (id: string) => void;
}) {
  const t = useTranslations();
  const [busy, setBusy] = useState(false);

  const handleCancel = async () => {
    setBusy(true);
    try {
      await cancelOrder(order.id);
      toast.success(t.customer.orders.cancelled);
      onCancelled(order.id);
    } catch {
      toast.error(t.customer.orders.cancelFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-3 space-y-2">
      <div className="flex items-center justify-between">
        <StatusBadge status={order.status} />
        <span className="text-[11px] text-muted-foreground">
          {new Date(order.created_at).toLocaleTimeString("lo-LA", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <ul className="space-y-1">
        {order.orderItems.map((oi) => (
          <li key={oi.id} className="flex items-start gap-1.5 text-xs">
            <span className="shrink-0 font-bold text-muted-foreground w-5 text-right">
              {oi.quantity}×
            </span>
            <span className="font-medium text-foreground">{oi.menuItem.name}</span>
            {oi.special_note && (
              <span className="text-status-preparing-foreground italic truncate">
                — {oi.special_note}
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-semibold">
          ₭{Number(order.total_amount).toLocaleString()}
        </span>
        {order.status === "PENDING" && (
          <button
            disabled={busy}
            onClick={handleCancel}
            className="flex items-center gap-1 text-[11px] font-semibold text-destructive border border-destructive/30 rounded-lg px-2.5 py-1 active:bg-destructive/10 disabled:opacity-50 transition-colors"
          >
            <X size={10} />
            {t.customer.orders.cancel}
          </button>
        )}
      </div>
    </div>
  );
}

export default function OrderListSheet({
  open,
  onClose,
  orders,
  loading,
  onRefresh,
  onOrderCancelled,
}: Props) {
  const t = useTranslations();
  const activeOrders = orders.filter(
    (o) => o.status === "PENDING" || o.status === "CONFIRMED",
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[70vh] flex flex-col rounded-t-2xl px-0 pt-0"
        aria-describedby={undefined}
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              {t.customer.orders.title}
            </SheetTitle>
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted transition-colors"
              aria-label={t.customer.orders.refreshAria}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              {t.customer.orders.loading}
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
              <ClipboardList size={36} strokeWidth={1.2} />
              <p className="text-sm">{t.customer.orders.noOrders}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activeOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onCancelled={onOrderCancelled}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
