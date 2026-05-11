'use client';

import { RefreshCw, Receipt, ChefHat, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/api';

interface Props {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  onOpenBill: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  SERVED: 'Served',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
};

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  CONFIRMED: 'outline',
  PREPARING: 'default',
  SERVED: 'outline',
  PAID: 'secondary',
  CANCELLED: 'destructive',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'SERVED',
};

function formatRp(n: number | string) {
  return `₭${Number(n).toLocaleString('en-US')}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function LiveOrdersTab({ orders, loading, onRefresh, onOpenBill, onUpdateStatus }: Props) {
  if (loading) {
    return (
      <div className="p-6 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* toolbar */}
      <div className="px-7 py-3.5 border-b flex items-center justify-between shrink-0">
        <p className="font-semibold text-sm text-muted-foreground">
          {orders.length} active orders
        </p>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={onRefresh}>
          <RefreshCw size={13} strokeWidth={2} />
          Refresh
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-7">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 text-muted-foreground gap-3">
              <ClipboardList size={44} strokeWidth={1.2} />
              <p className="text-sm">No active orders</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onOpenBill={() => onOpenBill(order.id)}
                  onUpdateStatus={(s) => onUpdateStatus(order.id, s)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function OrderCard({
  order,
  onOpenBill,
  onUpdateStatus,
}: {
  order: Order;
  onOpenBill: () => void;
  onUpdateStatus: (s: OrderStatus) => void;
}) {
  const next = NEXT_STATUS[order.status];

  return (
    <Card className={cn('rounded-2xl', order.status === 'SERVED' && 'ring-2 ring-primary/30')}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-sm">
              {order.order_type === 'TAKEAWAY'
                ? `Takeaway #${order.queue_number}`
                : `Table ${order.table?.table_number ?? '-'}`}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(order.created_at)}</p>
          </div>
          <Badge variant={STATUS_VARIANT[order.status]} className="text-[11px] shrink-0">
            {STATUS_LABEL[order.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        {/* items list */}
        <div className="space-y-1 mb-3">
          {order.orderItems.slice(0, 3).map((oi) => (
            <div key={oi.id} className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">
                {oi.quantity}× {oi.menuItem.name}
              </span>
              <span className="font-medium">
                {formatRp(Number(oi.unit_price) * oi.quantity)}
              </span>
            </div>
          ))}
          {order.orderItems.length > 3 && (
            <p className="text-[11px] text-muted-foreground">
              +{order.orderItems.length - 3} more items
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t mb-3">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="font-bold text-sm">{formatRp(Number(order.total_amount))}</span>
        </div>

        {/* actions */}
        <div className="flex gap-2">
          {next && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs gap-1"
              onClick={() => onUpdateStatus(next)}
            >
              <ChefHat size={12} strokeWidth={2} />
              {STATUS_LABEL[next]}
            </Button>
          )}
          <Button
            size="sm"
            className="flex-1 h-8 text-xs gap-1"
            variant={order.status === 'SERVED' ? 'default' : 'outline'}
            onClick={onOpenBill}
          >
            <Receipt size={12} strokeWidth={2} />
            Bill
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
