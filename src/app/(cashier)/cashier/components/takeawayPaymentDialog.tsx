// src/app/(cashier)/cashier/components/takeawayPaymentDialog.tsx
"use client";

import { useTranslations } from "@/lib/i18n";
import { PaymentDialog } from "./paymentDialog";
import type { Order } from "@/lib/api";

interface Props {
  order: Order | null;
  restaurantName: string;
  payment: "CASH" | "QR";
  onPaymentChange: (p: "CASH" | "QR") => void;
  onClose: () => void;
  onPrint: () => void;
}

export function TakeawayPaymentDialog({ order, restaurantName, payment, onPaymentChange, onClose, onPrint }: Props) {
  const t = useTranslations();
  return (
    <PaymentDialog
      open={!!order}
      order={order}
      restaurantName={restaurantName}
      subtitle={
        <>
          {t.common.takeaway} · <span className="font-mono">#{order?.queue_number}</span>
        </>
      }
      payment={payment}
      onPaymentChange={onPaymentChange}
      onClose={onClose}
      onPrint={onPrint}
    />
  );
}
