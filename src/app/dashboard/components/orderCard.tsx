"use client";

import { useState } from "react";
import { Order, updateOrderStatus, OrderStatus } from "@/lib/api";

interface Props {
  order: Order;
  onUpdated: (order: Order) => void;
}

const NEXT_STATUS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  PENDING: { next: "CONFIRMED", label: "ຢືນຢັນ" },
  CONFIRMED: { next: "PAID", label: "ຊຳລະແລ້ວ" },
};

export default function OrderCard({ order, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const minutesAgo = Math.floor(
    (Date.now() - new Date(order.created_at).getTime()) / 60000,
  );
  const timeLabel = minutesAgo < 1 ? "Just now" : `${minutesAgo}m ago`;

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border-2 border-status-confirmed-foreground/30 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="font-bold text-foreground text-base">
          {order.order_type === "TAKEAWAY"
            ? `Takeaway #${order.queue_number}`
            : `ໂຕະ ${order.table?.table_number ?? "-"}`}
        </span>
        <span className="text-xs text-muted-foreground">{timeLabel}</span>
      </div>

      {/* Items */}
      <div className="space-y-1.5 border-t pt-2">
        {order.orderItems.map((item) => (
          <div key={item.id} className="text-sm">
            <div className="flex justify-between">
              <span className="font-medium">
                {item.menuItem.name} × {item.quantity}
              </span>
            </div>
            {item.special_note && (
              <p className="text-xs text-status-preparing-foreground italic mt-0.5">
                ⚠ {item.special_note}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-2">
        <span>#{order.id.slice(-6).toUpperCase()}</span>
        <span>{new Date(order.created_at).toLocaleTimeString("lo-LA")}</span>
      </div>

      {NEXT_STATUS[order.status] && (
        <button
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            try {
              const { data } = await updateOrderStatus(order.id, NEXT_STATUS[order.status]!.next);
              onUpdated(data);
            } finally {
              setLoading(false);
            }
          }}
          className="w-full text-sm font-medium py-1.5 rounded-lg bg-status-confirmed-foreground text-white hover:bg-status-confirmed-foreground disabled:opacity-50 transition-colors"
        >
          {loading ? "..." : NEXT_STATUS[order.status]!.label}
        </button>
      )}
    </div>
  );
}
