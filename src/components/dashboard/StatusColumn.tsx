// src/components/dashboard/StatusColumn.tsx
"use client";

import { Order } from "@/lib/api";
import OrderCard from "./OrderCard";

const COLUMN_CONFIG = {
  PENDING: { label: "ລໍຖ້າຢືນຢັນ", color: "bg-yellow-50 border-yellow-200" },
  CONFIRMED: { label: "ຢືນຢັນແລ້ວ", color: "bg-blue-50 border-blue-200" },
  PREPARING: { label: "ກຳລັງປຸງ", color: "bg-orange-50 border-orange-200" },
  SERVED: { label: "ເສີບແລ້ວ", color: "bg-green-50 border-green-200" },
};

interface Props {
  status: keyof typeof COLUMN_CONFIG;
  orders: Order[];
  onUpdated: (order: Order) => void;
}

export default function StatusColumn({ status, orders, onUpdated }: Props) {
  const config = COLUMN_CONFIG[status];

  return (
    <div className={`rounded-xl border-2 ${config.color} p-3 min-h-[400px]`}>
      {/* Column Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-slate-700">{config.label}</h2>
        <span className="bg-white text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full border">
          {orders.length}
        </span>
      </div>

      {/* Orders */}
      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-8">ບໍ່ມີ Order</p>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdated={onUpdated} />
          ))
        )}
      </div>
    </div>
  );
}
