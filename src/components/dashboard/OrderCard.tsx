"use client";

import { Order } from "@/lib/api";

interface Props {
  order: Order;
}

export default function OrderCard({ order }: Props) {
  const minutesAgo = Math.floor(
    (Date.now() - new Date(order.created_at).getTime()) / 60000,
  );
  const timeLabel = minutesAgo < 1 ? "Just now" : `${minutesAgo}m ago`;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-blue-200 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="font-bold text-slate-900 text-base">
          {order.order_type === "TAKEAWAY"
            ? `Takeaway #${order.queue_number}`
            : `ໂຕະ ${order.table?.table_number ?? "-"}`}
        </span>
        <span className="text-xs text-slate-400">{timeLabel}</span>
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
              <p className="text-xs text-orange-500 italic mt-0.5">
                ⚠ {item.special_note}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 border-t pt-2">
        <span>#{order.id.slice(-6).toUpperCase()}</span>
        <span>{new Date(order.created_at).toLocaleTimeString("lo-LA")}</span>
      </div>
    </div>
  );
}
