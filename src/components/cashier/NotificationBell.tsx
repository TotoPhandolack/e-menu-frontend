"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { updateOrderStatus, cashierPrintKitchen, type Order } from "@/lib/api";

interface Props {
  pendingOrders: Order[];
  onRefresh: () => void;
}

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function NotificationBell({ pendingOrders, onRefresh }: Props) {
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
        `ຢືນຢັນ Order ໂຕະ ${order.table?.table_number ?? "Takeaway"} ແລ້ວ`,
      );
      onRefresh();
    } catch {
      toast.error("Failed to confirm order");
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (order: Order) => {
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, "CANCELLED");
      toast.success("Order cancelled");
      onRefresh();
    } catch {
      toast.error("Failed to cancel order");
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
            ? "bg-slate-100 text-slate-700"
            : count > 0
              ? "hover:bg-red-50 text-red-500"
              : "hover:bg-slate-100 text-muted-foreground"
        }`}
        aria-label="Order notifications"
      >
        <Bell size={20} className={count > 0 ? "animate-bell-ring" : ""} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1 leading-none pointer-events-none">
            {count}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          {/* Panel header 1*/}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <Bell size={13} className="text-slate-500" />
              <span className="text-sm font-bold text-slate-700">
                ລໍຖ້າການຢືນຢັນ
              </span>
            </div>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <span className="bg-red-100 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {count} orders
                </span>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-0.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Order list */}
          <ScrollArea className="max-h-[460px]">
            {count === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-3">
                <Bell size={32} strokeWidth={1.2} />
                <p className="text-sm">ບໍ່ມີ order ໃໝ່</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 space-y-3 hover:bg-slate-50 transition-colors"
                  >
                    {/* Order identity + time */}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">
                        {order.order_type === "TAKEAWAY"
                          ? `Takeaway #${order.queue_number}`
                          : `ໂຕະ ${order.table?.table_number ?? "-"}`}
                      </span>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {timeAgo(order.created_at)}
                      </span>
                    </div>

                    {/* Items list */}
                    <ul className="space-y-1">
                      {order.orderItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-start gap-1.5 text-xs"
                        >
                          <span className="shrink-0 font-bold text-slate-400 w-5 text-right">
                            {item.quantity}×
                          </span>
                          <span className="font-medium text-slate-700">
                            {item.menuItem.name}
                          </span>
                          {item.special_note && (
                            <span className="text-orange-500 italic truncate">
                              — {item.special_note}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>

                    {/* Total */}
                    <p className="text-xs font-semibold text-slate-500">
                      ₭{Number(order.total_amount).toLocaleString()}
                    </p>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                        disabled={busyId === order.id}
                        onClick={() => handleConfirm(order)}
                      >
                        ✓ ຢືນຢັນ & ສົ່ງຄົວ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs text-red-500 border-red-200 hover:bg-red-50 rounded-lg"
                        disabled={busyId === order.id}
                        onClick={() => handleCancel(order)}
                      >
                        ✕ ຍົກເລີກ
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
