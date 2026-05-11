'use client';

import { useState, useEffect } from 'react';
import { Banknote, CreditCard, Smartphone, Printer, SplitSquareHorizontal, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Bill, PaymentMethod, PaymentResult } from '@/lib/api';

interface Props {
  open: boolean;
  bill: Bill | null;
  loading: boolean;
  onClose: () => void;
  onPay: (method: PaymentMethod, amount: number) => Promise<PaymentResult | null>;
  onOpenSplitBill: () => void;
  onPrintReceipt: () => void;
}

const METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'CASH', label: 'Cash', icon: <Banknote size={16} strokeWidth={1.8} /> },
  { value: 'BANK_TRANSFER', label: 'Transfer', icon: <Smartphone size={16} strokeWidth={1.8} /> },
  { value: 'CREDIT_CARD', label: 'Card', icon: <CreditCard size={16} strokeWidth={1.8} /> },
];

function formatRp(n: number | string) {
  return `₭${Number(n).toLocaleString('en-US')}`;
}

export function PaymentModal({
  open,
  bill,
  loading,
  onClose,
  onPay,
  onOpenSplitBill,
  onPrintReceipt,
}: Props) {
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [amountStr, setAmountStr] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const amount = parseFloat(amountStr.replace(/\D/g, '')) || 0;
  const remaining = bill?.remaining_balance ?? 0;
  const change = method === 'CASH' ? Math.max(0, amount - remaining) : 0;
  const canPay = amount >= remaining || (method !== 'CASH' && amount > 0);

  useEffect(() => {
    if (!open) {
      setResult(null);
      setAmountStr('');
      setMethod('CASH');
    }
  }, [open]);

  const handlePay = async () => {
    if (!canPay) return;
    setProcessing(true);
    const res = await onPay(method, method === 'CASH' ? amount : remaining);
    setProcessing(false);
    if (res) setResult(res);
  };

  const handleAmountPreset = (value: number) => {
    setAmountStr(String(value));
  };

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {bill.order_type === 'TAKEAWAY'
                ? `Takeaway Bill #${bill.queue_number}`
                : `Table Bill — ${bill.table_id ? bill.table_id.slice(-4) : '-'}`}
            </DialogTitle>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[75vh]">
          {result?.is_fully_paid ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center py-8 px-5 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
              <div>
                <p className="font-bold text-lg">Payment Successful!</p>
                <p className="text-muted-foreground text-sm mt-1">
                  {formatRp(result.total_paid)} received
                </p>
                {result.change > 0 && (
                  <p className="text-green-600 font-semibold mt-1">
                    Change: {formatRp(result.change)}
                  </p>
                )}
              </div>
              <Button className="w-full gap-2" onClick={onPrintReceipt}>
                <Printer size={15} strokeWidth={2} />
                Print Receipt
              </Button>
              <Button variant="outline" className="w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            /* ── Payment form ── */
            <div className="px-5 py-4 space-y-4">
              {/* bill items */}
              <div className="space-y-1.5">
                {bill.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">
                      {item.quantity}× {item.name}
                      {item.special_note && (
                        <span className="text-xs text-muted-foreground/70 ml-1">({item.special_note})</span>
                      )}
                    </span>
                    <span className="font-medium">{formatRp(item.line_total)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* totals */}
              <div className="space-y-1.5">
                <BillRow label="Subtotal" value={formatRp(bill.subtotal)} />
                {bill.vat_rate > 0 && (
                  <BillRow
                    label={`VAT (${bill.vat_rate}%)`}
                    value={`+${formatRp(bill.vat_amount)}`}
                    valueClass="text-amber-600"
                  />
                )}
                {bill.service_charge_rate > 0 && (
                  <BillRow
                    label={`Service (${bill.service_charge_rate}%)`}
                    value={`+${formatRp(bill.service_charge_amount)}`}
                    valueClass="text-amber-600"
                  />
                )}
                {bill.already_paid > 0 && (
                  <BillRow
                    label="Already Paid"
                    value={`-${formatRp(bill.already_paid)}`}
                    valueClass="text-green-600"
                  />
                )}
              </div>

              <div className="flex justify-between items-center py-2 bg-muted/50 rounded-xl px-3">
                <span className="font-bold text-sm">Remaining Balance</span>
                <span className="font-bold text-base">{formatRp(remaining)}</span>
              </div>

              {/* split bill button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs h-8"
                onClick={onOpenSplitBill}
              >
                <SplitSquareHorizontal size={13} strokeWidth={2} />
                Split Bill
              </Button>

              <Separator />

              {/* payment method */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMethod(m.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all text-xs font-medium',
                        method === m.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40',
                      )}
                    >
                      {m.icon}
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* cash amount input */}
              {method === 'CASH' && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Amount Received</Label>
                  <Input
                    type="number"
                    placeholder={`Min. ${formatRp(remaining)}`}
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="h-10 text-sm"
                  />
                  {/* quick amount presets */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {[remaining, roundUp(remaining, 5000), roundUp(remaining, 10000), roundUp(remaining, 50000)]
                      .filter((v, i, arr) => arr.indexOf(v) === i)
                      .slice(0, 4)
                      .map((preset) => (
                        <button
                          key={preset}
                          onClick={() => handleAmountPreset(preset)}
                          className="text-[11px] px-2.5 py-1 rounded-lg border hover:bg-muted transition-colors font-medium"
                        >
                          {formatRp(preset)}
                        </button>
                      ))}
                  </div>
                  {amount >= remaining && (
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-muted-foreground">Change</span>
                      <span className="font-semibold text-green-600">{formatRp(change)}</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                className="w-full h-11 font-bold text-sm"
                onClick={handlePay}
                disabled={
                  processing ||
                  (method === 'CASH' && amount < remaining) ||
                  (method !== 'CASH' && remaining <= 0)
                }
              >
                {processing
                  ? 'Processing...'
                  : method === 'CASH'
                  ? `Pay ${amount >= remaining ? formatRp(amount) : '...'}`
                  : `Confirm ${formatRp(remaining)}`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BillRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className={cn('text-[13px] font-medium', valueClass)}>{value}</span>
    </div>
  );
}

function roundUp(amount: number, step: number) {
  return Math.ceil(amount / step) * step;
}
