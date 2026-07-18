'use client';

import { cn } from '@/lib/utils';
import type { Order } from '@/lib/api';
import { BILL_CSS, buildBillModel, renderBillInner } from '@/lib/bill';

interface Props {
  order: Order;
  restaurantName: string;
  className?: string;
}

/**
 * On-screen render of the bill/receipt. Shares its markup and stylesheet with the
 * thermal print output (see `printBill`), so what the cashier previews is exactly
 * what prints. Reusable across the POS and a future customer-facing bill page.
 */
export function BillReceipt({ order, restaurantName, className }: Props) {
  const model = buildBillModel(order, restaurantName);
  return (
    <div className={cn('bill-scope', className)}>
      <style>{BILL_CSS}</style>
      <div className="bill" dangerouslySetInnerHTML={{ __html: renderBillInner(model) }} />
    </div>
  );
}
