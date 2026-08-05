// src/app/(cashier)/cashier/components/paymentDialog.tsx
"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Check, Printer, QrCode, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";
import { BillReceipt } from "@/components/billReceipt";
import type { Order } from "@/lib/api";

interface Props {
  open: boolean;
  order: Order | null;
  restaurantName: string;
  subtitle: ReactNode;
  payment: "CASH" | "QR";
  onPaymentChange: (p: "CASH" | "QR") => void;
  onClose: () => void;
  onPrint: () => void;
  /** Disables the footer actions while a mark-paid/print request is in flight. */
  printing?: boolean;
}

function CashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M61,17H3a1,1,0,0,0-1,1V46a1,1,0,0,0,1,1H61a1,1,0,0,0,1-1V18A1,1,0,0,0,61,17ZM4,19H9.929A7.018,7.018,0,0,1,4,24.929ZM4,45V39.071A7.018,7.018,0,0,1,9.929,45Zm56,0H54.071A7.018,7.018,0,0,1,60,39.071Zm0-7.941A9.013,9.013,0,0,0,52.059,45H11.941A9.013,9.013,0,0,0,4,37.059V26.941A9.013,9.013,0,0,0,11.941,19H52.059A9.013,9.013,0,0,0,60,26.941Zm0-12.13A7.018,7.018,0,0,1,54.071,19H60Z" />
      <polygon points="37.293 25.293 33 29.586 33 23 31 23 31 31 29 31 29 33 31 33 31 41 33 41 33 34.414 37.293 38.707 38.707 37.293 34.414 33 37 33 37 31 34.414 31 38.707 26.707 37.293 25.293" />
    </svg>
  );
}

/**
 * Shared payment-method + receipt-preview dialog. Used for both takeaway
 * (see takeawayPaymentDialog.tsx) and dine-in (see liveOrdersTab.tsx) checkout,
 * which differ only in their header subtitle and how "print" resolves.
 */
export function PaymentDialog({
  open,
  order,
  restaurantName,
  subtitle,
  payment,
  onPaymentChange,
  onClose,
  onPrint,
  printing,
}: Props) {
  const t = useTranslations();
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Receipt size={18} />
            </div>
            <div>
              <DialogTitle className="text-lg">{t.cashier.takeaway.title}</DialogTitle>
              <DialogDescription>{subtitle}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-1 sm:grid-cols-[1fr_320px]">
          {/* Payment method */}
          <div className="flex min-w-0 flex-col gap-2.5 rounded-xl bg-card p-5 ring-1 ring-border">
            <span className="text-sm font-semibold text-foreground">
              {t.cashier.takeaway.paymentType}
            </span>

            <div className="flex flex-1 flex-col gap-3">
              {([
                { method: "CASH", label: t.cashier.takeaway.cash },
                { method: "QR", label: t.cashier.takeaway.qrCode },
              ] as const).map(({ method, label }) => {
                const selected = payment === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => onPaymentChange(method)}
                    aria-pressed={selected}
                    className={cn(
                      "relative flex w-full flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-background px-4 py-8 text-base font-semibold text-foreground ring-1 ring-border transition-colors",
                      selected
                        ? "bg-primary/10 text-primary-strong glow-selected"
                        : "hover:bg-muted/50",
                    )}
                  >
                    {selected && (
                      <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                    {method === "CASH" ? (
                      <CashIcon className="size-12" />
                    ) : (
                      <QrCode size={48} strokeWidth={1.75} />
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Receipt preview */}
          {order && <BillReceipt order={order} restaurantName={restaurantName} className="mx-auto min-w-0" />}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button onClick={onPrint} className="gap-1.5" disabled={printing}>
            <Printer size={15} />
            {t.cashier.takeaway.printBill}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
