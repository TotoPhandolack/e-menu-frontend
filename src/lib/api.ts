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
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD';

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

export const getMe = (token: string) =>
  api.get<Admin>('/auth/me', { headers: { Authorization: `Bearer ${token}` } });

// ─── Public / Customer ───────────────────────────────────────────────────────

export const scanQRNoLocation = (token: string) =>
  api.get<TableInfo>(`/tables/scan/${token}`);

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

// ─── Cashier: Billing ────────────────────────────────────────────────────────

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  special_note?: string;
}

export interface Bill {
  order_id: string;
  order_type: OrderType;
  queue_number?: string;
  table_id?: string;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  service_charge_rate: number;
  service_charge_amount: number;
  total_amount: number;
  already_paid: number;
  remaining_balance: number;
  items: BillItem[];
}

export const cashierGetBill = (order_id: string) =>
  api.get<Bill>(`/cashier/orders/${order_id}/bill`);

export interface SplitBillEqualResult {
  mode: 'equal';
  total_amount: number;
  splits: { label: string; amount: number }[];
}

export interface SplitBillByItemResult {
  mode: 'by_item';
  total_amount: number;
  splits: {
    label: string;
    items: { name: string; quantity: number; line_total: number }[];
    subtotal: number;
    vat_amount: number;
    service_charge_amount: number;
    amount: number;
  }[];
}

export const cashierSplitBill = (
  order_id: string,
  payload:
    | { mode: 'equal'; number_of_people: number }
    | { mode: 'by_item'; splits: { label: string; item_ids: string[] }[] },
) =>
  api.post<SplitBillEqualResult | SplitBillByItemResult>(
    `/cashier/orders/${order_id}/bill/split`,
    payload,
  );

export interface PaymentResult {
  order_id: string;
  order_status: OrderStatus;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  service_charge_rate: number;
  service_charge_amount: number;
  total_amount: number;
  already_paid: number;
  remaining_balance: number;
  payment_recorded: { method: PaymentMethod; amount: number };
  total_paid: number;
  change: number;
  is_fully_paid: boolean;
}

export const cashierProcessPayment = (
  order_id: string,
  method: PaymentMethod,
  amount: number,
) =>
  api.post<PaymentResult>(`/cashier/orders/${order_id}/pay`, { method, amount });

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

export const cashierPrintReceipt = (order_id: string) =>
  api.post(`/cashier/print/receipt/${order_id}`);

export const cashierPrintKitchen = (order_id: string) =>
  api.post(`/cashier/print/kitchen/${order_id}`);

export const cashierReprint = (order_id: string, type: 'receipt' | 'kitchen') =>
  api.post('/cashier/print/reprint', { order_id, type });
