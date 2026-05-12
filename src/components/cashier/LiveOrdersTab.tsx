'use client';

import { RefreshCw, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order } from '@/lib/api';

interface Props {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
}

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

export function LiveOrdersTab({ orders, loading, onRefresh }: Props) {
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
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2 pt-4 px-4">
        <div>
          <p className="font-bold text-sm">
            {order.order_type === 'TAKEAWAY'
              ? `Takeaway #${order.queue_number}`
              : `Table ${order.table?.table_number ?? '-'}`}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(order.created_at)}</p>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
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

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="font-bold text-sm">{formatRp(Number(order.total_amount))}</span>
        </div>
      </CardContent>
    </Card>
  );
}
