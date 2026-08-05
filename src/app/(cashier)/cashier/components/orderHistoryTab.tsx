'use client';

import { useState, useMemo } from 'react';
import { RefreshCw, History, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { useTranslations, type Translations } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { type Order } from '@/lib/api';

interface Props {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
}

type DateFilter = 'today' | 'yesterday' | 'all';
type TypeFilter = 'all' | 'TABLE' | 'TAKEAWAY';
type SourceFilter = 'all' | 'cashier' | 'customer';

const PAGE_SIZE = 10;

// Vertical rule between columns — the shared Table primitive only draws row borders.
const COL_DIVIDER = '[&>*:not(:last-child)]:border-r';

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
          ? 'bg-foreground text-white'
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
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const isCashier = order.session_id?.startsWith('cashier-');
  const isPaid = order.status === 'PAID';
  const COLS = 7;

  return (
    <>
      <TableRow
        aria-expanded={expanded}
        className={cn('cursor-pointer select-none', COL_DIVIDER)}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Order label */}
        <TableCell className="font-medium text-foreground">
          {order.order_type === 'TAKEAWAY'
            ? `${t.common.takeaway} #${order.queue_number ?? '-'}`
            : t.cashier.order.tableLabel(order.table?.table_number ?? '-')}
        </TableCell>

        {/* Type */}
        <TableCell>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              order.order_type === 'TAKEAWAY'
                ? 'bg-status-preparing text-status-preparing-foreground'
                : 'bg-status-confirmed text-status-confirmed-foreground'
            }`}
          >
            {order.order_type === 'TAKEAWAY' ? t.cashier.history.takeaway : t.cashier.history.dineIn}
          </span>
        </TableCell>

        {/* Source */}
        <TableCell>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isCashier
                ? 'bg-accent text-primary-strong'
                : 'bg-status-confirmed text-status-confirmed-foreground'
            }`}
          >
            {isCashier ? t.cashier.history.cashier : t.cashier.history.customer}
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
                ? 'bg-status-complete text-status-complete-foreground'
                : 'bg-destructive/15 text-destructive'
            }`}
          >
            {isPaid ? t.cashier.history.paid : t.cashier.history.cancelled}
          </span>
        </TableCell>

        {/* Total */}
        <TableCell className="font-semibold text-foreground">
          {formatKip(order.total_amount)}
        </TableCell>

        {/* Expand toggle */}
        <TableCell className="text-muted-foreground">
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
                  className="flex justify-between text-[12px] text-muted-foreground"
                >
                  <span>
                    {oi.quantity}× {oi.menuItem.name}
                    {oi.special_note && (
                      <span className="ml-1 text-status-preparing-foreground italic">
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
  const t = useTranslations();
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

  const [page, setPage] = useState(1);
  const changeDateFilter = (f: DateFilter) => { setDateFilter(f); setPage(1); };
  const changeTypeFilter = (f: TypeFilter) => { setTypeFilter(f); setPage(1); };
  const changeSourceFilter = (f: SourceFilter) => { setSourceFilter(f); setPage(1); };

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Filter & summary bar */}
      <div className="px-4 md:px-7 py-3 border-b shrink-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 items-center">
            {/* Date */}
            <FilterPill label={t.cashier.history.today}     active={dateFilter === 'today'}     onClick={() => changeDateFilter('today')} />
            <FilterPill label={t.cashier.history.yesterday} active={dateFilter === 'yesterday'} onClick={() => changeDateFilter('yesterday')} />
            <FilterPill label={t.cashier.history.all}       active={dateFilter === 'all'}       onClick={() => changeDateFilter('all')} />

            <span className="w-px h-4 bg-border mx-0.5" />

            {/* Order type */}
            <FilterPill label={t.cashier.history.allTypes} active={typeFilter === 'all'}      onClick={() => changeTypeFilter('all')} />
            <FilterPill label={t.cashier.history.table}    active={typeFilter === 'TABLE'}    onClick={() => changeTypeFilter('TABLE')} />
            <FilterPill label={t.cashier.history.takeaway} active={typeFilter === 'TAKEAWAY'} onClick={() => changeTypeFilter('TAKEAWAY')} />

            <span className="w-px h-4 bg-border mx-0.5" />

            {/* Source */}
            <FilterPill label={t.cashier.history.allSources} active={sourceFilter === 'all'}      onClick={() => changeSourceFilter('all')} />
            <FilterPill label={t.cashier.history.cashier}    active={sourceFilter === 'cashier'}   onClick={() => changeSourceFilter('cashier')} />
            <FilterPill label={t.cashier.history.customer}   active={sourceFilter === 'customer'}  onClick={() => changeSourceFilter('customer')} />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs shrink-0"
            onClick={onRefresh}
          >
            <RefreshCw size={13} strokeWidth={2} />
            {t.common.refresh}
          </Button>
        </div>

        {/* Summary */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{filtered.length}</span> {t.cashier.history.ordersWord}
          </span>
          <span>
            <span className="font-semibold text-status-complete-foreground">{paidCount}</span> {t.cashier.history.paidWord}
          </span>
          <span>
            {t.cashier.history.revenue}{' '}
            <span className="font-bold text-foreground">{formatKip(paidRevenue)}</span>
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
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground gap-3">
              <History size={44} strokeWidth={1.2} />
              <p className="text-sm">{t.cashier.history.noHistory}</p>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="px-4 md:px-7 py-4">
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className={cn('hover:bg-transparent', COL_DIVIDER)}>
                        <TableHead>{t.cashier.history.colOrder}</TableHead>
                        <TableHead>{t.cashier.history.colType}</TableHead>
                        <TableHead>{t.cashier.history.colSource}</TableHead>
                        <TableHead>{t.cashier.history.colTime}</TableHead>
                        <TableHead>{t.cashier.history.colStatus}</TableHead>
                        <TableHead>{t.cashier.history.colTotal}</TableHead>
                        <TableHead className="w-8" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((order) => (
                        <OrderRow key={order.id} order={order} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </ScrollArea>
          )}

          <PaginationBar
            t={t}
            page={currentPage}
            pageCount={pageCount}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function PaginationBar({
  t,
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
}: {
  t: Translations;
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="px-4 md:px-7 py-3 border-t shrink-0 flex items-center justify-between">
      <p className="text-xs text-muted-foreground">{t.cashier.history.pageInfo(from, to, total)}</p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t.cashier.history.prevPage}
        >
          <ChevronLeft size={14} />
        </Button>
        <span className="text-xs font-semibold text-foreground tabular-nums min-w-[3.5rem] text-center">
          {page} / {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label={t.cashier.history.nextPage}
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
