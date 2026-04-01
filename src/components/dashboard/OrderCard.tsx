"use client";

import { Order } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/lib/api";
import { toast } from "sonner";

const NEXT_STATUS: Record<string, Order["status"] | null> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "SERVED",
  SERVED: "PAID",
  PAID: null,
  CANCELLED: null,
};

const NEXT_LABEL: Record<string, string> = {
  PENDING: "ຢືນຢັນ Order",
  CONFIRMED: "ເລີ່ມປຸງ",
  PREPARING: "ເສີບແລ້ວ",
  SERVED: "ຮັບເງິນ",
};

interface Props {
  order: Order;
  onUpdated: (order: Order) => void;
}

export default function OrderCard({ order, onUpdated }: Props) {
  const nextStatus = NEXT_STATUS[order.status];

  const handleUpdate = async () => {
    if (!nextStatus) return;
    try {
      const { data } = await updateOrderStatus(order.id, nextStatus);
      onUpdated(data);
      toast.success(
        `Order #${order.id.slice(-6).toUpperCase()} → ${nextStatus}`,
      );
    } catch {
      toast.error("Failed to update order");
    }
  };

  const handleCancel = async () => {
    try {
      const { data } = await updateOrderStatus(order.id, "CANCELLED");
      onUpdated(data);
      toast.success("Order cancelled");
    } catch {
      toast.error("Failed to cancel order");
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="font-semibold text-slate-900">
          #{order.id.slice(-6).toUpperCase()}
        </span>
        <span className="text-xs text-slate-400">
          โต๊ะ {order.table?.table_number ?? "-"}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1 border-t pt-2">
        {order.orderItems.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.menuItem.name} × {item.quantity}
            </span>
            {item.special_note && (
              <span className="text-xs text-orange-500 italic">
                {item.special_note}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between text-sm font-medium border-t pt-2">
        <span>ລວມ</span>
        <span>₭{Number(order.total_amount).toLocaleString()}</span>
      </div>

      {/* Time */}
      <p className="text-xs text-slate-400">
        {new Date(order.created_at).toLocaleTimeString("lo-LA")}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        {nextStatus && (
          <Button className="flex-1 text-sm" onClick={handleUpdate}>
            {NEXT_LABEL[order.status]}
          </Button>
        )}
        {order.status === "PENDING" && (
          <Button
            variant="outline"
            className="text-sm text-red-500 border-red-200 hover:bg-red-50"
            onClick={handleCancel}
          >
            ຍົກເລີກ
          </Button>
        )}
      </div>
    </div>
  );
}
