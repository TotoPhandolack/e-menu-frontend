// src/stores/cart.store.ts
import { create } from "zustand";
import { MenuItem } from "@/lib/api";

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  special_note?: string;
}

interface CartStore {
  items: CartItem[];
  table_id: string | null;
  restaurant_id: string | null;
  session_id: string | null;

  setTableInfo: (table_id: string, restaurant_id: string) => void;
  addItem: (menuItem: MenuItem) => void;
  removeItem: (menu_item_id: string) => void;
  updateQuantity: (menu_item_id: string, quantity: number) => void;
  updateNote: (menu_item_id: string, note: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  table_id: null,
  restaurant_id: null,
  session_id: null,

  setTableInfo: (table_id, restaurant_id) =>
    set({
      table_id,
      restaurant_id,
      // generate session_id ครั้งเดียวตอน scan QR
      session_id: `session-${Date.now()}`,
    }),

  addItem: (menuItem) => {
    const existing = get().items.find((i) => i.menuItem.id === menuItem.id);
    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i.menuItem.id === menuItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        ),
      }));
    } else {
      set((state) => ({ items: [...state.items, { menuItem, quantity: 1 }] }));
    }
  },

  removeItem: (menu_item_id) =>
    set((state) => ({
      items: state.items.filter((i) => i.menuItem.id !== menu_item_id),
    })),

  updateQuantity: (menu_item_id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menu_item_id);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.menuItem.id === menu_item_id ? { ...i, quantity } : i,
      ),
    }));
  },

  updateNote: (menu_item_id, note) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.menuItem.id === menu_item_id ? { ...i, special_note: note } : i,
      ),
    })),

  clearCart: () => set({ items: [] }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce(
      (sum, i) => sum + Number(i.menuItem.price) * i.quantity,
      0,
    ),
}));
