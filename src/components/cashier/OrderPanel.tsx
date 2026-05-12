'use client';

import { useState } from 'react';
import { ShoppingBag, Plus, Minus, Edit2, Trash2, UtensilsCrossed, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NoteEditDialog } from './NoteEditDialog';
import type { MenuItem, TableInfo, OrderType } from '@/lib/api';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  note: string;
}

interface Props {
  cart: CartItem[];
  tables: TableInfo[];
  selectedTableId: string;
  orderType: OrderType;
  onTableChange: (id: string) => void;
  onOrderTypeChange: (t: OrderType) => void;
  onQtyChange: (itemId: string, delta: number) => void;
  onNoteChange: (itemId: string, note: string) => void;
  onRemove: (itemId: string) => void;
  onCreateOrder: () => void;
  creating: boolean;
}

function formatRp(n: number | string) {
  return `₭${Number(n).toLocaleString('en-US')}`;
}

export function OrderPanel({
  cart,
  tables,
  selectedTableId,
  orderType,
  onTableChange,
  onOrderTypeChange,
  onQtyChange,
  onNoteChange,
  onRemove,
  onCreateOrder,
  creating,
}: Props) {
  const [editingNote, setEditingNote] = useState<{ itemId: string; name: string; note: string } | null>(null);

  const subtotal = cart.reduce((s, i) => s + i.menuItem.price * i.quantity, 0);
  const canOrder = cart.length > 0 && (orderType === 'TAKEAWAY' || !!selectedTableId);

  const availableTables = tables.filter((t) => t.status === 'AVAILABLE' || t.id === selectedTableId);

  return (
    <>
      <div className="w-92.5 shrink-0 bg-background border-l flex flex-col overflow-hidden">
        {/* header */}
        <div className="px-5 py-4 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={20} strokeWidth={1.8} />
            <span className="font-bold text-base">Order List</span>
          </div>
          {cart.length > 0 && (
            <Badge variant="secondary" className="font-semibold">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </Badge>
          )}
        </div>

        {/* order type + table */}
        <div className="px-5 py-3 border-b flex gap-2.5 shrink-0">
          <Select value={orderType} onValueChange={(v) => onOrderTypeChange(v as OrderType)}>
            <SelectTrigger className="flex-1 h-9 text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TABLE">Dine In</SelectItem>
              <SelectItem value="TAKEAWAY">Take Away</SelectItem>
            </SelectContent>
          </Select>

          {orderType === 'TABLE' && (
            <Select value={selectedTableId} onValueChange={onTableChange}>
              <SelectTrigger className="flex-1 h-9 text-[13px]">
                <SelectValue placeholder="Select Table" />
              </SelectTrigger>
              <SelectContent>
                {availableTables.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    Table {t.table_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* cart items */}
        <ScrollArea className="flex-1">
          <div className="px-5 py-1">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2.5">
                <ShoppingBag size={40} strokeWidth={1.2} />
                <p className="text-sm">No items selected</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.menuItem.id} className="flex items-start gap-3 py-3 border-b last:border-0">
                  {/* thumbnail */}
                  <div className="w-13 h-13 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {item.menuItem.image_url || item.menuItem.imge_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.menuItem.image_url ?? item.menuItem.imge_url}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Utensils className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-semibold text-[13px] leading-snug line-clamp-1">
                        {item.menuItem.name}
                      </span>
                      <button
                        onClick={() => onRemove(item.menuItem.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-0.5"
                      >
                        <Trash2 size={12} strokeWidth={2} />
                      </button>
                    </div>

                    {/* note */}
                    <button
                      onClick={() =>
                        setEditingNote({
                          itemId: item.menuItem.id,
                          name: item.menuItem.name,
                          note: item.note,
                        })
                      }
                      className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5 mb-2 hover:text-foreground transition-colors"
                    >
                      <Edit2 size={10} strokeWidth={2} />
                      <span className="truncate max-w-37.5">
                        {item.note || 'Add note...'}
                      </span>
                    </button>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[13px]">
                        {formatRp(item.menuItem.price * item.quantity)}
                      </span>

                      {/* qty controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onQtyChange(item.menuItem.id, -1)}
                          className="w-6 h-6 rounded-full border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                        >
                          <Minus size={10} strokeWidth={2.5} />
                        </button>
                        <span className="font-semibold text-[13px] w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onQtyChange(item.menuItem.id, 1)}
                          className="w-6 h-6 rounded-full border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                        >
                          <Plus size={10} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* payment summary */}
        <div className="px-5 py-4 border-t shrink-0">
          <p className="font-bold text-sm mb-3">Summary</p>
          <div className="space-y-2">
            <SummaryRow label="Subtotal" value={formatRp(subtotal)} />
            <SummaryRow
              label="Tax & Service"
              value="Calculated at billing"
              valueClass="text-muted-foreground text-xs"
            />
          </div>

          <Separator className="my-3" />

          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm">Estimated Total</span>
            <span className="font-bold text-sm">{formatRp(subtotal)}</span>
          </div>

          <Button
            className="w-full h-11 font-bold text-sm gap-2"
            onClick={onCreateOrder}
            disabled={!canOrder || creating}
          >
            <UtensilsCrossed size={16} strokeWidth={2} />
            {creating ? 'Processing...' : 'Place Order'}
          </Button>

          {!canOrder && cart.length > 0 && orderType === 'TABLE' && (
            <p className="text-xs text-destructive text-center mt-2">Please select a table first</p>
          )}
        </div>
      </div>

      {/* note editing dialog */}
      {editingNote && (
        <NoteEditDialog
          open={!!editingNote}
          itemName={editingNote.name}
          currentNote={editingNote.note}
          onSave={(note) => {
            onNoteChange(editingNote.itemId, note);
            setEditingNote(null);
          }}
          onClose={() => setEditingNote(null)}
        />
      )}
    </>
  );
}

function SummaryRow({
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
      <span className={`text-[13px] font-medium ${valueClass ?? ''}`}>{value}</span>
    </div>
  );
}
