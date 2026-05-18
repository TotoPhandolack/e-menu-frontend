"use client";

import { useEffect, useState } from "react";
import {
  Order,
  getOrdersByRestaurant,
  getRestaurants,
  Restaurant,
} from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";
import OrderCard from "@/components/dashboard/OrderCard";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";

export default function DashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const { admin, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    getRestaurants().then(({ data }) => {
      setRestaurants(data);
      if (data.length > 0) setSelectedRestaurant(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedRestaurant) return;
    setLoading(true);
    // Backend now returns only CONFIRMED orders for the kitchen
    getOrdersByRestaurant(selectedRestaurant)
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, [selectedRestaurant]);

  // WebSocket — real-time updates
  useSocket(
    selectedRestaurant,
    // new_order: cashier created directly (already CONFIRMED), show it
    (newOrder) => {
      if (newOrder.status === 'CONFIRMED') {
        setOrders((prev) => [...prev, newOrder]);
        toast.success(`ສັ່ງໃໝ່! ໂຕະ ${newOrder.table?.table_number ?? 'Takeaway'}`);
      }
    },
    // order_status_changed: cashier confirmed a customer order, or marked PAID/CANCELLED
    (updatedOrder) => {
      if (updatedOrder.status === 'CONFIRMED') {
        // Add to kitchen view if not already there
        setOrders((prev) =>
          prev.find((o) => o.id === updatedOrder.id)
            ? prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
            : [...prev, updatedOrder],
        );
        toast.success(`Order ຢືນຢັນແລ້ວ! ໂຕະ ${updatedOrder.table?.table_number ?? 'Takeaway'}`);
      } else {
        // PAID or CANCELLED — remove from kitchen view
        setOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
      }
    },
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-slate-600" />
          <h1 className="text-xl font-semibold">Kitchen Display</h1>
          <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {orders.length} in kitchen
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{admin?.name}</span>
          <select
            className="border rounded-lg px-3 py-1.5 text-sm bg-white"
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            ອອກຈາກລະບົບ
          </Button>
        </div>
      </div>

      {/* Kitchen order grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">ກຳລັງໂຫຼດ...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
          <ChefHat className="h-12 w-12" />
          <p className="text-sm">ບໍ່ມີ order ໃນຄົວ</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 p-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
