"use client";

import { useEffect, useState } from "react";
import {
  Order,
  getOrdersByRestaurant,
  getRestaurants,
  Restaurant,
} from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";
import StatusColumn from "@/components/dashboard/StatusColumn";
import { toast } from "sonner";

const ACTIVE_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "SERVED",
] as const;

export default function DashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // โหลด restaurant list
  useEffect(() => {
    getRestaurants().then(({ data }) => {
      setRestaurants(data);
      if (data.length > 0) setSelectedRestaurant(data[0].id);
    });
  }, []);

  // โหลด orders เมื่อเลือกร้าน
  useEffect(() => {
    if (!selectedRestaurant) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getOrdersByRestaurant(selectedRestaurant)
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, [selectedRestaurant]);

  // WebSocket — รับ order ใหม่ real-time
  useSocket(
    selectedRestaurant,
    (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      toast.success(`Order ໃໝ່! โต๊ะ ${newOrder.table?.table_number}`);
    },
    (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
      );
    },
  );

  // อัปเดต order ใน state
  const handleUpdated = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Kitchen Dashboard</h1>
        <select
          className="border rounded-lg px-3 py-1.5 text-sm bg-white"
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
        >
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">ກຳລັງໂຫຼດ...</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 p-6">
          {ACTIVE_STATUSES.map((status) => (
            <StatusColumn
              key={status}
              status={status}
              orders={orders.filter((o) => o.status === status)}
              onUpdated={handleUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
