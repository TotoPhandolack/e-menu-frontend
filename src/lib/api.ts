// src/lib/api.ts
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";



const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

export default api;

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // ถ้า token หมดอายุ logout อัตโนมัติ
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

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
  created_at: string | number | Date;
  id: string;
  status:
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "SERVED"
  | "PAID"
  | "CANCELLED";
  total_amount: number;
  table?: Table | null;
  orderItems: {
    id: string;
    quantity: number;
    unit_price: number;
    special_note?: string;
    menuItem: MenuItem;
  }[];
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  restaurant_id: string;
  restaurant: { name: string };
}

export interface AuthResponse {
  access_token: string;
  admin: Admin;
}

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password });

export const getMe = (token: string) =>
  api.get<Admin>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

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

export const getOrdersByRestaurant = (restaurant_id: string) =>
  api.get<Order[]>(`/orders/restaurant/${restaurant_id}`);

export const getRestaurants = () => api.get<Restaurant[]>("/restaurants");

export const updateOrderStatus = (order_id: string, status: Order["status"]) =>
  api.put<Order>(`/orders/${order_id}/status`, { status });
