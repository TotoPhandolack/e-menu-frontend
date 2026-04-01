// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

export default api;

// --- Types ---
export interface Restaurant {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
}

export interface Table {
  table_id: string;
  table_number: string;
  restaurant_id: string;
  restaurant_name: string;
  distance_meters: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  category: { id: string; name: string };
}

export interface Order {
  id: string;
  status:
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "SERVED"
  | "PAID"
  | "CANCELLED";
  total_amount: number;
  orderItems: {
    id: string;
    quantity: number;
    unit_price: number;
    special_note?: string;
    menuItem: MenuItem;
  }[];
}

// --- API calls ---
export const scanQR = (token: string, latitude: number, longitude: number) =>
  api.post<Table>(`/tables/scan/${token}`, { latitude, longitude });

export const getMenuItems = (restaurant_id: string) =>
  api.get<MenuItem[]>(`/menu-items/restaurant/${restaurant_id}`);

export const createOrder = (data: {
  table_id: string;
  session_id: string;
  items: { menu_item_id: string; quantity: number; special_note?: string }[];
}) => api.post<Order>("/orders", data);

export const getOrdersByTable = (table_id: string) =>
  api.get<Order[]>(`/orders/table/${table_id}`);
