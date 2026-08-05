// Single source of truth for the bill / receipt.
//
// The same content model + markup + stylesheet drives all three surfaces:
//   • on-screen POS preview  (<BillReceipt> renders `renderBillInner` via React)
//   • thermal print (80mm)    (`printBill` embeds `renderBillInner` + `BILL_CSS` in an iframe)
//   • customer digital bill   (future page can reuse the same component)
//
// It is deliberately bilingual (Lao primary · English secondary) on every label,
// regardless of the app's active language — a printed receipt outlives the session
// that produced it.

import type { Order } from './api';

// ─── Formatting ──────────────────────────────────────────────────────────────

/** Kip has no minor unit in practice — round and group with thousands separators. */
export function formatKip(n: number | string): string {
  return `${Math.round(Number(n)).toLocaleString('en-US')}<span class="bill-currency">₭</span>`;
}

/** Escape user-supplied strings before they enter the HTML string renderer. */
function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
}

// ─── Model ───────────────────────────────────────────────────────────────────

interface BilingualLabel {
  lo: string;
  en: string;
}

interface BillMetaRow extends BilingualLabel {
  value: string;
}

interface BillLine {
  name: string;
  note?: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface BillModel {
  restaurantName: string;
  orderType: BilingualLabel;
  metaRows: BillMetaRow[];
  items: BillLine[];
  subtotal: number;
  /** total_amount − subtotal, when the backend total carries tax/service; 0 otherwise. */
  taxService: number;
  total: number;
  isPaid: boolean;
}

/**
 * Build the receipt model from an order.
 *
 * Subtotal is derived from the line items (quantity × unit_price). The backend's
 * `total_amount` is treated as the authoritative grand total; any positive
 * difference is surfaced as a single "Tax & Service" row. This stays exact with
 * the data we actually have — no rates guessed, nothing invented.
 */
export function buildBillModel(order: Order, restaurantName: string): BillModel {
  const isTakeaway = order.order_type === 'TAKEAWAY';

  const items: BillLine[] = order.orderItems.map((oi) => {
    const unitPrice = Number(oi.unit_price);
    return {
      name: oi.menuItem.name,
      note: oi.special_note?.trim() || undefined,
      qty: oi.quantity,
      unitPrice,
      lineTotal: oi.quantity * unitPrice,
    };
  });

  const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
  const total = Number(order.total_amount);
  const taxService = Math.max(0, Math.round(total - subtotal));

  const d = new Date(order.created_at);
  const dateStr = d.toLocaleDateString('en-GB'); // dd/mm/yyyy
  const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const metaRows: BillMetaRow[] = [
    isTakeaway
      ? { lo: 'ຄິວ', en: 'Queue', value: `#${order.queue_number ?? '-'}` }
      : { lo: 'ໂຕະ', en: 'Table', value: order.table?.table_number ?? '-' },
    { lo: 'ວັນທີ · ເວລາ', en: 'Date · Time', value: `${dateStr} · ${timeStr}` },
    { lo: 'ເລກທີ່', en: 'Bill No', value: order.id.slice(-6).toUpperCase() },
  ];

  return {
    restaurantName: restaurantName.trim() || 'Restaurant',
    orderType: isTakeaway ? { lo: 'ຊື້ກັບ', en: 'Takeaway' } : { lo: 'ກິນຢູ່ຮ້ານ', en: 'Dine-in' },
    metaRows,
    items,
    subtotal,
    taxService,
    total,
    isPaid: order.status === 'PAID',
  };
}

// ─── Markup ──────────────────────────────────────────────────────────────────

function metaRow(row: BillMetaRow): string {
  return `<div class="bill-meta-row">
      <div class="bill-k"><span class="lo">${esc(row.lo)}</span><span class="en">${esc(row.en)}</span></div>
      <div class="bill-v">${esc(row.value)}</div>
    </div>`;
}

function itemRow(it: BillLine): string {
  return `<div class="bill-item">
      <div class="bill-item-l">
        <div class="bill-item-name">${esc(it.name)}</div>
        <div class="bill-item-sub">${it.qty} × ${formatKip(it.unitPrice)}</div>
        ${it.note ? `<div class="bill-item-note">${esc(it.note)}</div>` : ''}
      </div>
      <div class="bill-item-amt">${formatKip(it.lineTotal)}</div>
    </div>`;
}

/**
 * Render the receipt body (the children of `.bill`) as an HTML string.
 * All dynamic text is escaped, so the output is safe for `dangerouslySetInnerHTML`
 * and for direct injection into the print iframe.
 */
export function renderBillInner(model: BillModel): string {
  const taxRow =
    model.taxService > 0
      ? `<div class="bill-total-row">
          <span class="lbl">ພາສີ &amp; ບໍລິການ · Tax &amp; Service</span>
          <span class="amt">${formatKip(model.taxService)}</span>
        </div>`
      : '';

  const stamp = model.isPaid ? `<div class="bill-stamp">✓ ຊຳລະແລ້ວ · PAID</div>` : '';

  return `<header class="bill-head">
      <div class="bill-name">${esc(model.restaurantName)}</div>
      <div class="bill-sub">ໃບບິນ · Receipt</div>
      <div class="bill-type">${esc(model.orderType.lo)} · ${esc(model.orderType.en)}</div>
    </header>

    <div class="bill-perf"></div>

    <div class="bill-meta">${model.metaRows.map(metaRow).join('')}</div>

    <div class="bill-perf"></div>

    <div class="bill-items">
      <div class="bill-items-head"><span>ລາຍການ · Item</span><span>ລວມ · Total</span></div>
      ${model.items.map(itemRow).join('')}
    </div>

    <div class="bill-perf"></div>

    <div class="bill-totals">
      <div class="bill-total-row">
        <span class="lbl">ລວມຍ່ອຍ · Subtotal</span>
        <span class="amt">${formatKip(model.subtotal)}</span>
      </div>
      ${taxRow}
      <div class="bill-grand">
        <span class="bill-grand-k"><span class="lo">ລວມທັງໝົດ</span><span class="en">TOTAL</span></span>
        <span class="bill-grand-v">${formatKip(model.total)}</span>
      </div>
    </div>

    ${stamp}

    <div class="bill-foot">
      <div class="lo">ຂອບໃຈທີ່ໃຊ້ບໍລິການ</div>
      <div class="en">Thank you</div>
    </div>`;
}

// ─── Stylesheet ──────────────────────────────────────────────────────────────

// Self-contained and scoped under `.bill`. Font families resolve through the
// app's next/font CSS variables on screen; in the print iframe those vars are
// undefined, so each stack falls back to a literal family loaded via Google Fonts.
export const BILL_CSS = `
.bill {
  --bill-mono: var(--font-roboto-mono, 'Roboto Mono'), ui-monospace, monospace;
  --bill-sans: var(--font-outfit, 'Outfit'), var(--font-noto-lao, 'Noto Sans Lao'), system-ui, sans-serif;
  --bill-lao: var(--font-phetsarath, 'Phetsarath OT'), var(--font-noto-lao, 'Noto Sans Lao'), var(--font-outfit, 'Outfit'), sans-serif;
  --bill-ink: #1e1e1e;
  --bill-slate: #767676;
  --bill-hair: #e6e6e6;
  --bill-ghost: #f6f6f6;
  box-sizing: border-box;
  width: 320px;
  max-width: 100%;
  margin: 0 auto;
  padding: 22px 20px 24px;
  background: #fff;
  color: var(--bill-ink);
  font-family: var(--bill-sans);
  font-size: 13px;
  line-height: 1.6;
  text-align: left;
}
.bill * { box-sizing: border-box; }
@media screen {
  .bill { box-shadow: 0 0 0 1px rgba(30, 30, 30, 0.1); border-radius: 14px; }
}

.bill-head { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.bill-name { font-family: var(--bill-lao); font-weight: 700; font-size: 17px; line-height: 1.3; letter-spacing: -0.01em; }
.bill-sub { font-size: 11px; letter-spacing: 0.14em; color: var(--bill-slate); }
.bill-type { margin-top: 6px; font-size: 10.5px; line-height: 1; color: var(--bill-ink); border: 1px solid var(--bill-hair); border-radius: 999px; padding: 4px 11px; }

.bill-perf { height: 0; border: none; border-top: 1.5px dashed #cfcfcf; margin: 13px 0; }

.bill-meta { display: flex; flex-direction: column; gap: 8px; }
.bill-meta-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.bill-k { display: flex; flex-direction: column; line-height: 1.25; }
.bill-k .lo { font-size: 12px; color: var(--bill-ink); }
.bill-k .en { font-size: 9.5px; color: var(--bill-slate); }
.bill-v { font-family: var(--bill-mono); font-size: 12.5px; font-weight: 500; text-align: right; white-space: nowrap; }

.bill-items-head { display: flex; justify-content: space-between; font-size: 10px; color: var(--bill-slate); padding-bottom: 7px; border-bottom: 1px solid var(--bill-hair); }
.bill-item { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f1f1f1; }
.bill-item:last-child { border-bottom: none; padding-bottom: 0; }
.bill-item-l { min-width: 0; }
.bill-item-name { font-size: 13px; font-weight: 500; color: var(--bill-ink); }
.bill-item-sub { font-family: var(--bill-mono); font-size: 11px; color: var(--bill-slate); margin-top: 1px; }
.bill-item-note { font-size: 11px; font-style: italic; color: var(--bill-slate); margin-top: 2px; line-height: 1.4; }
.bill-item-amt { font-family: var(--bill-mono); font-size: 13px; font-weight: 600; white-space: nowrap; padding-top: 1px; }

.bill-totals { display: flex; flex-direction: column; gap: 9px; }
.bill-total-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.bill-total-row .lbl { font-size: 12px; color: var(--bill-slate); }
.bill-total-row .amt { font-family: var(--bill-mono); font-size: 12.5px; font-weight: 500; color: var(--bill-ink); white-space: nowrap; }

.bill-grand { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 3px; padding: 11px 14px; border: 1.5px solid var(--bill-ink); border-radius: 12px; background: var(--bill-ghost); }
.bill-grand-k { display: flex; flex-direction: column; line-height: 1.15; }
.bill-grand-k .lo { font-family: var(--bill-lao); font-size: 14px; font-weight: 700; color: var(--bill-ink); }
.bill-grand-k .en { font-size: 9.5px; font-weight: 600; letter-spacing: 0.08em; color: var(--bill-slate); }
.bill-grand-v { font-family: var(--bill-mono); font-size: 19px; font-weight: 700; color: var(--bill-ink); white-space: nowrap; }

.bill-currency { font-size: 0.65em; font-weight: 500; margin-left: 1px; }

.bill-stamp { width: fit-content; margin: 16px auto 0; font-family: var(--bill-mono); font-size: 11.5px; font-weight: 700; letter-spacing: 0.08em; color: var(--bill-ink); border: 1.5px solid var(--bill-ink); border-radius: 8px; padding: 4px 14px; transform: rotate(-2.5deg); opacity: 0.9; }

.bill-foot { text-align: center; margin-top: 18px; }
.bill-foot .lo { font-family: var(--bill-lao); font-size: 12.5px; color: var(--bill-ink); }
.bill-foot .en { font-size: 10px; color: var(--bill-slate); margin-top: 1px; }
`;
