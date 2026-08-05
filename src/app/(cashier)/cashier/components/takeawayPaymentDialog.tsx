// src/app/(cashier)/cashier/components/takeawayPaymentDialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Banknote, CreditCard, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";
import { BillReceipt } from "@/components/billReceipt";
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
    <Dialog open={!!order} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{t.cashier.takeaway.title}</DialogTitle>
          <DialogDescription>
            {t.common.takeaway} #{order?.queue_number}
          </DialogDescription>
        </DialogHeader>

        <div className="my-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CreditCard size={18} className="text-muted-foreground" />
            {t.cashier.takeaway.paymentType}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { method: "CASH", icon: Banknote, label: t.cashier.takeaway.cash },
              { method: "QR", icon: QrCode, label: t.cashier.takeaway.qrCode },
            ] as const).map(({ method, icon: Icon, label }) => {
              const selected = payment === method;
              return (
                <button
                  key={method}
                  onClick={() => onPaymentChange(method)}
                  aria-pressed={selected}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 rounded-xl border py-5 text-sm font-bold transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/40",
                  )}
                >
                  {selected && (
                    <span className="absolute top-2.5 right-2.5 size-2.5 rounded-full bg-primary-foreground" />
                  )}
                  <Icon size={24} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {order && (
          <div className="rounded-xl bg-muted/40 p-4">
            <BillReceipt order={order} restaurantName={restaurantName} />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50"
            onClick={onClose}
          >
            {t.common.cancel}
          </Button>
          <Button onClick={onPrint}>{t.cashier.takeaway.printBill}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
