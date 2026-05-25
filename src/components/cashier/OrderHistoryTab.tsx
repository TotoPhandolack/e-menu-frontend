'use client';

import { useState, useMemo } from 'react';
import { RefreshCw, History, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Order } from '@/lib/api';

interface Props {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
}

type DateFilter = 'today' | 'yesterday' | 'all';
type TypeFilter = 'all' | 'TABLE' | 'TAKEAWAY';
type SourceFilter = 'all' | 'cashier' | 'customer';

function formatKip(n: number | string) {
  return `₭${Number(n).toLocaleString('en-US')}`;
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDateRange(filter: DateFilter): { start: Date; end: Date } | null {
  if (filter === 'all') return null;
  const now = new Date();
  if (filter === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { start, end };
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-colors ${
        active
          ? 'bg-slate-800 text-white'
          : 'bg-muted text-muted-foreground hover:bg-muted/70'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// ─── Expandable table rows ────────────────────────────────────────────────────

function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const isCashier = order.session_id?.startsWith('cashier-');
  const isPaid = order.status === 'PAID';
  const COLS = 7;

  return (
    <>
      <TableRow
        aria-expanded={expanded}
        className="cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Order label */}
        <TableCell className="font-medium text-slate-800">
          {order.order_type === 'TAKEAWAY'
            ? `Takeaway #${order.queue_number ?? '-'}`
            : `ໂຕະ ${order.table?.table_number ?? '-'}`}
        </TableCell>

        {/* Type */}
        <TableCell>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              order.order_type === 'TAKEAWAY'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            {order.order_type === 'TAKEAWAY' ? 'Takeaway' : 'Dine-in'}
          </span>
        </TableCell>

        {/* Source */}
        <TableCell>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isCashier
                ? 'bg-violet-100 text-violet-700'
                : 'bg-sky-100 text-sky-700'
            }`}
          >
            {isCashier ? 'Cashier' : 'Customer'}
          </span>
        </TableCell>

        {/* Date/time */}
        <TableCell className="text-muted-foreground text-xs">
          {formatDateTime(order.created_at)}
        </TableCell>

        {/* Status */}
        <TableCell>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isPaid
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {isPaid ? 'PAID' : 'CANCELLED'}
          </span>
        </TableCell>

        {/* Total */}
        <TableCell className="text-right font-semibold text-slate-800">
          {formatKip(order.total_amount)}
        </TableCell>

        {/* Expand toggle */}
        <TableCell className="text-muted-foreground text-right pr-4">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </TableCell>
      </TableRow>

      {/* Expanded items sub-row */}
      {expanded && (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell colSpan={COLS} className="py-2 px-4">
            <div className="space-y-1 py-1">
              {order.orderItems.map((oi) => (
                <div
                  key={oi.id}
                  className="flex justify-between text-[12px] text-slate-600"
                >
                  <span>
                    {oi.quantity}× {oi.menuItem.name}
                    {oi.special_note && (
                      <span className="ml-1 text-orange-500 italic">
                        ({oi.special_note})
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums">
                    {formatKip(Number(oi.unit_price) * oi.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export function OrderHistoryTab({ orders, loading, onRefresh }: Props) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  const filtered = useMemo(() => {
    const range = getDateRange(dateFilter);
    return orders.filter((o) => {
      if (range) {
        const t = new Date(o.created_at);
        if (t < range.start || t >= range.end) return false;
      }
      if (o.order_type === 'TAKEAWAY' && o.status === 'CANCELLED') return false;
      if (typeFilter !== 'all' && o.order_type !== typeFilter) return false;
      if (sourceFilter === 'cashier' && !o.session_id?.startsWith('cashier-'))
        return false;
      if (sourceFilter === 'customer' && o.session_id?.startsWith('cashier-'))
        return false;
      return true;
    });
  }, [orders, dateFilter, typeFilter, sourceFilter]);

  const paidCount = useMemo(
    () => filtered.filter((o) => o.status === 'PAID').length,
    [filtered],
  );

  const paidRevenue = useMemo(
    () =>
      filtered
        .filter((o) => o.status === 'PAID')
        .reduce((s, o) => s + Number(o.total_amount), 0),
    [filtered],
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Filter & summary bar */}
      <div className="px-4 md:px-7 py-3 border-b shrink-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 items-center">
            {/* Date */}
            <FilterPill label="ມື້ນີ້"    active={dateFilter === 'today'}     onClick={() => setDateFilter('today')} />
            <FilterPill label="ມື້ວານ"   active={dateFilter === 'yesterday'} onClick={() => setDateFilter('yesterday')} />
            <FilterPill label="ທັງໝົດ"   active={dateFilter === 'all'}       onClick={() => setDateFilter('all')} />

            <span className="w-px h-4 bg-border mx-0.5" />

            {/* Order type */}
            <FilterPill label="ທຸກປະເພດ" active={typeFilter === 'all'}      onClick={() => setTypeFilter('all')} />
            <FilterPill label="ໂຕະ"      active={typeFilter === 'TABLE'}    onClick={() => setTypeFilter('TABLE')} />
            <FilterPill label="Takeaway"  active={typeFilter === 'TAKEAWAY'} onClick={() => setTypeFilter('TAKEAWAY')} />

            <span className="w-px h-4 bg-border mx-0.5" />

            {/* Source */}
            <FilterPill label="ທຸກ Source" active={sourceFilter === 'all'}      onClick={() => setSourceFilter('all')} />
            <FilterPill label="Cashier"    active={sourceFilter === 'cashier'}   onClick={() => setSourceFilter('cashier')} />
            <FilterPill label="Customer"   active={sourceFilter === 'customer'}  onClick={() => setSourceFilter('customer')} />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs shrink-0"
            onClick={onRefresh}
          >
            <RefreshCw size={13} strokeWidth={2} />
            Refresh
          </Button>
        </div>

        {/* Summary */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-slate-700">{filtered.length}</span> orders
          </span>
          <span>
            <span className="font-semibold text-emerald-700">{paidCount}</span> paid
          </span>
          <span>
            Revenue:{' '}
            <span className="font-bold text-slate-800">{formatKip(paidRevenue)}</span>
          </span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-6 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 text-muted-foreground gap-3">
          <History size={44} strokeWidth={1.2} />
          <p className="text-sm">ບໍ່ພົບ order ປະຫວັດ</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="px-4 md:px-7 py-4">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Order</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
