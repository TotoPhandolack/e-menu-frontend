// src/app/order-status/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOrdersByTable, Order } from "@/lib/api";
import { useCartStore } from "@/stores/cart.store";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import { CheckCircle, Clock, ChefHat, UtensilsCrossed } from "lucide-react";

const STATUS_CONFIG = {
  PENDING: {
    label: "ລໍຖ້າຢືນຢັນ",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800",
  },
  CONFIRMED: {
    label: "ຢືນຢັນແລ້ວ",
    icon: CheckCircle,
    color: "bg-blue-100 text-blue-800",
  },
  PREPARING: {
    label: "ກຳລັງປຸງ",
    icon: ChefHat,
    color: "bg-orange-100 text-orange-800",
  },
  SERVED: {
    label: "ເສີບແລ້ວ",
    icon: UtensilsCrossed,
    color: "bg-green-100 text-green-800",
  },
  PAID: {
    label: "ຊຳລະແລ້ວ",
    icon: CheckCircle,
    color: "bg-slate-100 text-slate-800",
  },
  CANCELLED: {
    label: "ຍົກເລີກ",
    icon: Clock,
    color: "bg-red-100 text-red-800",
  },
};

export default function OrderStatusPage() {
  const searchParams = useSearchParams();
  const table_id = searchParams.get("table_id");
  const { restaurant_id, clearCart } = useCartStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!table_id) return;
    try {
      const { data } = await getOrdersByTable(table_id);
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  // ✅ real-time — อัปเดต status ทันทีโดยไม่ต้อง polling
  useSocket(
    restaurant_id,
    () => {}, // new_order ไม่ต้องทำอะไรฝั่ง customer
    (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
      );
      toast.success(
        `ສະຖານະອັບເດດ: ${STATUS_CONFIG[updatedOrder.status as keyof typeof STATUS_CONFIG]?.label}`,
      );
    },
  );

  useEffect(() => {
    clearCart();
    fetchOrders();
  }, [table_id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">ກຳລັງໂຫຼດ...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <h1 className="text-lg font-semibold mb-4">ສະຖານະການສັ່ງອາຫານ</h1>
      <div className="space-y-4">
        {orders.map((order) => {
          const config = STATUS_CONFIG[order.status];
          const Icon = config.icon;
          return (
            <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-slate-500">
                  Order #{order.id.slice(-6).toUpperCase()}
                </span>
                <span
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${config.color}`}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                </span>
              </div>
              <div className="space-y-1">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.menuItem.name} × {item.quantity}
                    </span>
                    <span className="text-slate-500">
                      ₭
                      {(
                        Number(item.unit_price) * item.quantity
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
                <span>ລວມ</span>
                <span>₭{Number(order.total_amount).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
