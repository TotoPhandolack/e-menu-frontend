# AGENT.md — Emenu Frontend

## Project Overview

**Emenu** is an online food ordering system for restaurants. Customers can scan a QR code to order food from their table. The system also includes a restaurant management POS dashboard for kitchen staff and cashiers.

This repository is the **frontend only**. The backend is a separate NestJS API.

---

## Tech Stack

| Layer            | Technology           |
| ---------------- | -------------------- |
| Framework        | Next.js (App Router) |
| Language         | TypeScript           |
| Styling          | Tailwind CSS         |
| UI Components    | shadcn/ui            |
| State Management | Zustand              |
| Form Handling    | React Hook Form      |
| Auth             | NextAuth.js          |

---

## Folder Structure

```
src/
├── app/              # Next.js pages (App Router)
├── components/       # Shared/reusable components
├── stores/           # Zustand stores
└── ...
```

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3019
```

- Always use `NEXT_PUBLIC_API_URL` as the base URL when calling the backend API
- Never hardcode API URLs

---

## API Integration

Use `fetch` or `axios` with `NEXT_PUBLIC_API_URL` as base. Auth token comes from **NextAuth session**.

```ts
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu`);
```

---

## Realtime (Socket.io)

The backend uses **Socket.io** for realtime updates (e.g. order status, kitchen notifications). Connect from the frontend using `socket.io-client`:

```ts
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_URL!);

socket.on("orderUpdate", (data) => {
  // handle realtime order update
});
```

---

## State Management (Zustand)

Stores live in `src/stores/`. Follow this pattern:

```ts
import { create } from "zustand";

type ExampleStore = {
  loading: boolean;
  data: SomeType[];
  fetchData: () => Promise<void>;
};

export const useExampleStore = create<ExampleStore>((set) => ({
  loading: false,
  data: [],

  fetchData: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`);
      const data = await res.json();
      set({ loading: false, data });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
}));
```

---

## Form Handling

Use **React Hook Form** for all forms. Add validation where needed.

```ts
import { useForm } from "react-hook-form";

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<FormValues>();

const onSubmit = async (data: FormValues) => {
  await someStoreAction(data);
};
```

---

## Naming Conventions

Use **camelCase** for all files, variables, functions, and component names.

```ts
// ✅ Correct
orderStore.ts;
useOrderStore;
fetchOrders();
menuCard.tsx;

// ❌ Wrong
OrderStore.ts;
order_store.ts;
fetch_orders();
```

---

## Component Structure

Shared/reusable components live in `src/components/`. When a page grows, extract sub-components into a `components/` folder next to the `page.tsx`.

```
src/app/
└── orders/
    ├── page.tsx
    └── components/
        ├── orderCard.tsx
        └── orderStatusBadge.tsx
```

---

## Language

**Primary UI language is Lao (ພາສາລາວ).** All user-facing text — labels, placeholders, error messages, toasts, confirmations — must be written in Lao.

```ts
// ✅ Correct
"ກະລຸນາເລືອກລາຍການ";
"ສັ່ງອາຫານສຳເລັດແລ້ວ";

// ❌ Wrong
"Please select an item";
"Order placed successfully";
```
