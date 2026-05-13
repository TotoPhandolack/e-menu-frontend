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
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Uploaded images are stored as "/uploads/…" (relative to the API server).
 * Prefix them with the API base URL so the browser fetches from the right origin.
 */
export function resolveImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/uploads/')) {
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  }
  return url;
}

// ─── Shared Types ────────────────────────────────────────────────────────────

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  vat_rate: number;
  service_charge_rate: number;
}

export interface TableInfo {
  id: string;
  restaurant_id: string;
  table_number: string;
  qr_code_token: string;
  capacity: number;
  is_active: boolean;
  status: 'AVAILABLE' | 'OCCUPIED';
}

export interface Category {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  imge_url?: string; // backend typo
  is_available: boolean;
  category: Category;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SERVED' | 'PAID' | 'CANCELLED';
export type OrderType = 'TABLE' | 'TAKEAWAY';

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  special_note?: string;
  menuItem: Pick<MenuItem, 'id' | 'name' | 'price'>;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id?: string;
  session_id: string;
  order_type: OrderType;
  queue_number?: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
  table?: { id: string; table_number: string } | null;
  orderItems: OrderItem[];
}

export type AdminRole = 'ADMIN' | 'CASHIER';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  restaurant_id: string;
  restaurant: { name: string };
}

export interface AuthResponse {
  access_token: string;
  admin: Admin;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password });

export const registerAdmin = (data: {
  name: string;
  email: string;
  password: string;
  restaurant_id: string;
  role?: 'ADMIN' | 'CASHIER';
}) => api.post<{ message: string; id: string }>('/auth/register', data);

export const getMe = (token: string) =>
  api.get<Admin>('/auth/me', { headers: { Authorization: `Bearer ${token}` } });

// ─── Public / Customer ───────────────────────────────────────────────────────

export interface RestaurantScanResponse {
  restaurant_id: string;
  restaurant_name: string;
  distance_meters: number;
  categories: Array<{
    id: string;
    name: string;
    sort_order: number;
    menuItems: MenuItem[];
  }>;
}

export const scanQRNoLocation = (token: string) =>
  api.get<TableInfo>(`/tables/scan/${token}`);

export const scanRestaurant = (restaurant_id: string, latitude: number, longitude: number) =>
  api.post<RestaurantScanResponse>(`/restaurants/${restaurant_id}/scan`, { latitude, longitude });

export const scanQR = (token: string, latitude: number, longitude: number) =>
  api.post<TableInfo>(`/tables/scan/${token}`, { latitude, longitude });

export const getMenuItems = (restaurant_id: string) =>
  api.get<MenuItem[]>(`/menu-items/restaurant/${restaurant_id}`);

export const createOrder = (data: {
  table_id: string;
  session_id: string;
  items: { menu_item_id: string; quantity: number; special_note?: string }[];
  latitude: number;
  longitude: number;
}) => api.post<Order>('/orders', data);

export const getOrdersByTable = (table_id: string) =>
  api.get<Order[]>(`/orders/table/${table_id}`);

export const getOrdersByRestaurant = (restaurant_id: string) =>
  api.get<Order[]>(`/orders/restaurant/${restaurant_id}`);

export const getRestaurants = () => api.get<Restaurant[]>('/restaurants');

export const updateOrderStatus = (order_id: string, status: OrderStatus) =>
  api.put<Order>(`/orders/${order_id}/status`, { status });

// ─── Cashier: Table Management ───────────────────────────────────────────────

export const cashierOpenTable = (table_id: string) =>
  api.patch<TableInfo>(`/cashier/tables/${table_id}/open`);

export const cashierMoveTable = (table_id: string, target_table_id: string) =>
  api.patch<TableInfo>(`/cashier/tables/${table_id}/move`, { target_table_id });

export const cashierClearTable = (table_id: string) =>
  api.post<TableInfo & { qr_image: string }>(`/cashier/tables/${table_id}/clear`);

export const getTables = (restaurant_id: string) =>
  api.get<TableInfo[]>(`/tables/restaurant/${restaurant_id}`);

export interface CreateTablePayload {
  restaurant_id: string;
  table_number: string;
  capacity: number;
}

export const createTable = (data: CreateTablePayload) =>
  api.post<TableInfo & { qr_image: string }>('/tables', data);

export interface UpdateTablePayload {
  table_number?: string;
  capacity?: number;
}

export const updateTable = (id: string, data: UpdateTablePayload) =>
  api.put<TableInfo>(`/tables/${id}`, data);

export const deleteTable = (id: string) =>
  api.delete<TableInfo>(`/tables/${id}`);

// ─── Cashier: Order Management ───────────────────────────────────────────────

export interface CreateCashierOrderPayload {
  order_type: OrderType;
  table_id?: string;
  items: { menu_item_id: string; quantity: number; special_note?: string }[];
}

export const cashierCreateOrder = (data: CreateCashierOrderPayload) =>
  api.post<Order>('/cashier/orders', data);

export const cashierGetLiveOrders = () =>
  api.get<Order[]>('/cashier/orders/live');

export const cashierAddOrderItems = (
  order_id: string,
  items: { menu_item_id: string; quantity: number; special_note?: string }[],
) => api.post<Order>(`/cashier/orders/${order_id}/items`, { items });

export const cashierUpdateOrderItem = (
  order_id: string,
  item_id: string,
  data: { quantity?: number; special_note?: string },
) => api.patch<Order>(`/cashier/orders/${order_id}/items/${item_id}`, data);

export const cashierDeleteOrderItem = (order_id: string, item_id: string) =>
  api.delete<Order>(`/cashier/orders/${order_id}/items/${item_id}`);

// ─── Cashier: Menu Item Management ──────────────────────────────────────────

export const cashierGetMenuItems = () =>
  api.get<MenuItem[]>('/cashier/menu-items');

export interface CreateMenuItemPayload {
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  imge_url?: string;
}

export const createMenuItem = (data: CreateMenuItemPayload) =>
  api.post<MenuItem>('/menu-items', data);

export const updateMenuItem = (
  id: string,
  data: Partial<{ name: string; description: string; price: number; imge_url: string; is_available: boolean; category_id: string }>,
) => api.put<MenuItem>(`/menu-items/${id}`, data);

export const deleteMenuItem = (id: string) =>
  api.delete(`/menu-items/${id}`);

export const uploadMenuItemImage = (id: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post<MenuItem>(`/menu-items/${id}/image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getCategories = (restaurant_id: string) =>
  api.get<Array<{ id: string; name: string; sort_order: number }>>(`/categories/restaurant/${restaurant_id}`);

// ─── Cashier: Menu Availability ──────────────────────────────────────────────

export const cashierToggleMenuItemAvailability = (
  item_id: string,
  is_available: boolean,
) =>
  api.patch<{ id: string; name: string; is_available: boolean }>(
    `/cashier/menu-items/${item_id}/availability`,
    { is_available },
  );

// ─── Cashier: Printing ───────────────────────────────────────────────────────

export const cashierPrintKitchen = (order_id: string) =>
  api.post(`/cashier/print/kitchen/${order_id}`);

export const cashierReprint = (order_id: string, type: 'receipt' | 'kitchen') =>
  api.post('/cashier/print/reprint', { order_id, type });
