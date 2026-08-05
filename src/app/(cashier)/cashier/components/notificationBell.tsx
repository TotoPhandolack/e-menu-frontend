"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, X, Check, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations, type Translations } from "@/lib/i18n";
import { updateOrderStatus, cashierPrintKitchen, type Order } from "@/lib/api";

interface Props {
  pendingOrders: Order[];
  onRefresh: () => void;
  onOrderClick: (order: Order) => void;
}

function timeAgo(dateStr: string, t: Translations) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return t.cashier.time.justNow;
  if (mins < 60) return t.cashier.time.minutesAgo(mins);
  return t.cashier.time.hoursAgo(Math.floor(mins / 60));
}

export function NotificationBell({ pendingOrders, onRefresh, onOrderClick }: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const count = pendingOrders.length;

  // The API hands back live orders oldest-first; a notification list reads
  // newest-first, so sort here rather than relying on arrival order.
  const orders = useMemo(
    () =>
      [...pendingOrders].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [pendingOrders],
  );

  const updateScrollState = () => {
    const el = listRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  };

  // Recompute after the panel opens or the order list changes size
  useEffect(() => {
    if (open) updateScrollState();
  }, [open, count]);

  const scrollBy = (delta: number) => {
    listRef.current?.scrollBy({ top: delta, behavior: "smooth" });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleConfirm = async (order: Order) => {
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, "CONFIRMED");
      cashierPrintKitchen(order.id).catch(() => null);
      toast.success(
        t.cashier.live.orderConfirmed(order.table?.table_number ?? t.common.takeaway),
      );
      onRefresh();
    } catch {
      toast.error(t.cashier.live.confirmFailed);
    } finally {
      setBusyId(null);
    }
  };

  const handleOrderClick = (order: Order) => {
    setOpen(false);
    onOrderClick(order);
  };

  const handleCancel = async (order: Order) => {
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, "CANCELLED");
      toast.success(t.cashier.live.orderCancelled);
      onRefresh();
    } catch {
      toast.error(t.cashier.live.cancelFailed);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div ref={ref} className="relative">
      {/* ── Bell trigger button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative p-2 rounded-xl transition-colors ${
          open
            ? "bg-muted text-foreground"
            : count > 0
              ? "hover:bg-destructive/10 text-destructive"
              : "hover:bg-muted text-muted-foreground"
        }`}
        aria-label={t.cashier.notif.ariaLabel}
      >
        <Bell size={20} className={count > 0 ? "animate-bell-ring" : ""} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex pointer-events-none">
            <span className="absolute inset-0 rounded-full bg-destructive opacity-75 animate-ping" />
            <span className="relative bg-destructive text-white text-[9px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1 leading-none">
              {count}
            </span>
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-90 bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden">
          {/* Panel header 1*/}
          <div className="flex items-center justify-between px-4 py-3 bg-muted border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Bell size={13} className="text-muted-foreground" />
              <span className="text-sm font-bold text-foreground">
                {t.cashier.notif.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <span className="bg-destructive/15 text-destructive text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {t.cashier.notif.ordersCount(count)}
                </span>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-0.5 rounded-md hover:bg-muted text-muted-foreground hover:text-muted-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Order list */}
          <div className="relative">
          <div
            ref={listRef}
            onScroll={updateScrollState}
            className="max-h-96 overflow-y-auto"
          >
            {count === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-3">
                <Bell size={32} strokeWidth={1.2} />
                <p className="text-sm">{t.cashier.notif.noNew}</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {orders.map((order) => (
                  <li key={order.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOrderClick(order)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleOrderClick(order);
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors hover:bg-muted focus-visible:bg-muted outline-none"
                    >
                      {/* Identity + one-line item summary */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-[13px] text-foreground truncate">
                            {order.order_type === "TAKEAWAY"
                              ? `${t.common.takeaway} #${order.queue_number}`
                              : t.cashier.order.tableLabel(order.table?.table_number ?? "-")}
                          </span>
                          <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 ml-auto">
                            {timeAgo(order.created_at, t)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-[11px] text-muted-foreground truncate">
                            {order.orderItems
                              .map((item) => `${item.quantity}× ${item.menuItem.name}`)
                              .join(", ")}
                          </p>
                          <p className="text-[11px] font-semibold text-foreground tabular-nums shrink-0 ml-auto">
                            ₭{Number(order.total_amount).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Inline actions — icon-only to keep the row compact */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          title={t.cashier.notif.confirmAndSend}
                          aria-label={t.cashier.notif.confirmAndSend}
                          disabled={busyId === order.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirm(order);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-status-complete text-status-complete-foreground transition-colors hover:bg-status-complete-foreground hover:text-white disabled:opacity-50"
                        >
                          <Check size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          title={t.cashier.notif.cancel}
                          aria-label={t.cashier.notif.cancel}
                          disabled={busyId === order.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(order);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {canScrollUp && (
            <button
              type="button"
              onClick={() => scrollBy(-160)}
              aria-label={t.cashier.notif.scrollUp}
              className="absolute top-1.5 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card/95 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronUp size={14} />
            </button>
          )}
          {canScrollDown && (
            <button
              type="button"
              onClick={() => scrollBy(160)}
              aria-label={t.cashier.notif.scrollDown}
              className="absolute bottom-1.5 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card/95 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronDown size={14} />
            </button>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
