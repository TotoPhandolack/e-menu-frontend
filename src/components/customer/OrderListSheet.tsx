// src/components/customer/OrderListSheet.tsx
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
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  onOrderCancelled: (orderId: string) => void;
}

function StatusBadge({ status }: { status: Order["status"] }) {
  if (status === "PENDING")
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
        <Clock size={9} />
        ລໍຖ້າ
      </span>
    );
  if (status === "CONFIRMED")
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
        <ChefHat size={9} />
        ໃນຄົວ
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
  const [busy, setBusy] = useState(false);

  const handleCancel = async () => {
    setBusy(true);
    try {
      await cancelOrder(order.id);
      toast.success("ຍົກເລີກ order ແລ້ວ");
      onCancelled(order.id);
    } catch {
      toast.error("ບໍ່ສາມາດຍົກເລີກໄດ້");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-3 space-y-2">
      <div className="flex items-center justify-between">
        <StatusBadge status={order.status} />
        <span className="text-[11px] text-slate-400">
          {new Date(order.created_at).toLocaleTimeString("lo-LA", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <ul className="space-y-1">
        {order.orderItems.map((oi) => (
          <li key={oi.id} className="flex items-start gap-1.5 text-xs">
            <span className="shrink-0 font-bold text-slate-400 w-5 text-right">
              {oi.quantity}×
            </span>
            <span className="font-medium text-slate-700">{oi.menuItem.name}</span>
            {oi.special_note && (
              <span className="text-orange-500 italic truncate">
                — {oi.special_note}
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-semibold">
          ₭{Number(order.total_amount).toLocaleString()}
        </span>
        {order.status === "PENDING" && (
          <button
            disabled={busy}
            onClick={handleCancel}
            className="flex items-center gap-1 text-[11px] font-semibold text-red-500 border border-red-200 rounded-lg px-2.5 py-1 active:bg-red-50 disabled:opacity-50 transition-colors"
          >
            <X size={10} />
            ຍົກເລີກ
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
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              ລາຍການສັ່ງຂອງທ່ານ
            </SheetTitle>
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Refresh orders"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
              ກຳລັງໂຫຼດ...
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
              <ClipboardList size={36} strokeWidth={1.2} />
              <p className="text-sm">ບໍ່ມີລາຍການສັ່ງ</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
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
