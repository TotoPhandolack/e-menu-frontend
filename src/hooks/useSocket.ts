// src/hooks/useSocket.ts
"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(
  restaurant_id: string | null,
  onNewOrder: (order: any) => void,
  onStatusChanged: (order: any) => void,
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!restaurant_id) return;

    // connect ไป Backend
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL!);

    // join room ของร้าน
    socketRef.current.emit("join_restaurant", restaurant_id);

    // รับ event จาก Backend
    socketRef.current.on(`restaurant_${restaurant_id}`, (data) => {
      if (data.event === "new_order") onNewOrder(data.order);
      if (data.event === "order_status_changed") onStatusChanged(data.order);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [restaurant_id]);
}
