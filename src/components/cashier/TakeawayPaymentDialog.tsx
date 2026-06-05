// src/components/cashier/TakeawayPaymentDialog.tsx
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
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/api";

interface Props {
  order: Order | null;
  payment: "CASH" | "QR";
  onPaymentChange: (p: "CASH" | "QR") => void;
  onClose: () => void;
  onPrint: () => void;
}

export function TakeawayPaymentDialog({ order, payment, onPaymentChange, onClose, onPrint }: Props) {
  return (
    <Dialog open={!!order} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">ຊຳລະເງິນ / Payment</DialogTitle>
          <DialogDescription>
            Takeaway #{order?.queue_number}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 my-4">
          <button
            onClick={() => onPaymentChange("CASH")}
            className={cn(
              "flex-1 py-8 rounded-2xl border-2 font-bold text-base transition-colors flex flex-col items-center gap-2",
              payment === "CASH"
                ? "border-slate-800 bg-slate-800 text-white"
                : "border-muted text-muted-foreground hover:border-slate-400",
            )}
          >
            <span className="text-3xl">💵</span>
            Cash
          </button>
          <button
            onClick={() => onPaymentChange("QR")}
            className={cn(
              "flex-1 py-8 rounded-2xl border-2 font-bold text-base transition-colors flex flex-col items-center gap-2",
              payment === "QR"
                ? "border-slate-800 bg-slate-800 text-white"
                : "border-muted text-muted-foreground hover:border-slate-400",
            )}
          >
            <span className="text-3xl">📱</span>
            QR Code
          </button>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50"
            onClick={onClose}
          >
            ຍົກເລີກ / Cancel
          </Button>
          <Button onClick={onPrint}>ພິມໃບບິນ / Print</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
