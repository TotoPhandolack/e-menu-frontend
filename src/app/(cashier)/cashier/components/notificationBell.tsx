"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "react-toastify";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useTranslations, type Translations } from "@/lib/i18n";
import { updateOrderStatus, cashierPrintKitchen, type Order } from "@/lib/api";

interface Props {
  pendingOrders: Order[];
  onRefresh: () => void;
  onOrderClick: () => void;
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
  const count = pendingOrders.length;

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

  const handleOrderClick = () => {
    setOpen(false);
    onOrderClick();
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
          <span className="absolute -top-0.5 -right-0.5 bg-destructive text-white text-[9px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1 leading-none pointer-events-none">
            {count}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-[340px] bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden">
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
          <ScrollArea className="max-h-[460px]">
            {count === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-3">
                <Bell size={32} strokeWidth={1.2} />
                <p className="text-sm">{t.cashier.notif.noNew}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    role="button"
                    tabIndex={0}
                    onClick={handleOrderClick}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleOrderClick();
                      }
                    }}
                    className="p-4 space-y-3 hover:bg-muted transition-colors cursor-pointer"
                  >
                    {/* Order identity + time */}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">
                        {order.order_type === "TAKEAWAY"
                          ? `${t.common.takeaway} #${order.queue_number}`
                          : t.cashier.order.tableLabel(order.table?.table_number ?? "-")}
                      </span>
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {timeAgo(order.created_at, t)}
                      </span>
                    </div>

                    {/* Items list */}
                    <ul className="space-y-1">
                      {order.orderItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-start gap-1.5 text-xs"
                        >
                          <span className="shrink-0 font-bold text-muted-foreground w-5 text-right">
                            {item.quantity}×
                          </span>
                          <span className="font-medium text-foreground">
                            {item.menuItem.name}
                          </span>
                          {item.special_note && (
                            <span className="text-status-preparing-foreground italic truncate">
                              — {item.special_note}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>

                    {/* Total */}
                    <p className="text-xs font-semibold text-muted-foreground">
                      ₭{Number(order.total_amount).toLocaleString()}
                    </p>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs bg-status-complete-foreground hover:bg-status-complete-foreground text-white rounded-lg"
                        disabled={busyId === order.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirm(order);
                        }}
                      >
                        {t.cashier.notif.confirmAndSend}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 rounded-lg"
                        disabled={busyId === order.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(order);
                        }}
                      >
                        {t.cashier.notif.cancel}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
