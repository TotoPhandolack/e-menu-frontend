import type { Order } from './api';

export function printBill(order: Order, restaurantName: string) {
  const date = new Date(order.created_at);
  const dateStr = date.toLocaleDateString('en-GB');
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const title =
    order.order_type === 'TAKEAWAY'
      ? `Takeaway #${order.queue_number}`
      : `ໂຕະ ${order.table?.table_number ?? '-'}`;

  const rows = order.orderItems
    .map((oi) => {
      const subtotal = oi.quantity * Number(oi.unit_price);
      return `
        <tr>
          <td>${oi.menuItem.name}${oi.special_note ? `<br/><span class="note">(${oi.special_note})</span>` : ''}</td>
          <td class="center">${oi.quantity}</td>
          <td class="right">₭${Number(oi.unit_price).toLocaleString('en-US')}</td>
          <td class="right">₭${subtotal.toLocaleString('en-US')}</td>
        </tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="UTF-8"/>
  <title>Bill - ${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      width: 80mm;
      padding: 6mm 4mm;
      color: #111;
    }
    .center { text-align: center; }
    .right   { text-align: right; }
    h1 { font-size: 16px; text-align: center; margin-bottom: 2px; }
    .subtitle { text-align: center; font-size: 11px; color: #555; margin-bottom: 8px; }
    .divider { border: none; border-top: 1px dashed #999; margin: 6px 0; }
    .meta { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 4px 0; }
    th { font-size: 11px; border-bottom: 1px solid #999; padding: 2px 0; text-align: left; }
    th.center { text-align: center; }
    th.right  { text-align: right; }
    td { padding: 3px 0; vertical-align: top; }
    td.center { text-align: center; }
    td.right  { text-align: right; }
    .note { font-size: 10px; color: #e85; }
    .total-row { font-weight: bold; font-size: 14px; }
    .thank { text-align: center; font-size: 12px; margin-top: 10px; }
    @media print {
      body { width: 100%; }
    }
  </style>
</head>
<body>
  <h1>${restaurantName}</h1>
  <p class="subtitle">ໃບບິນ / Receipt</p>
  <hr class="divider"/>
  <div class="meta"><span>${title}</span><span>${dateStr} ${timeStr}</span></div>
  <hr class="divider"/>
  <table>
    <thead>
      <tr>
        <th>ລາຍການ</th>
        <th class="center">ຈຳນວນ</th>
        <th class="right">ລາຄາ</th>
        <th class="right">ລວມ</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <hr class="divider"/>
  <table>
    <tr class="total-row">
      <td>ລວມທັງໝົດ</td>
      <td class="right">₭${Number(order.total_amount).toLocaleString('en-US')}</td>
    </tr>
  </table>
  <hr class="divider"/>
  <p class="thank">ຂອບໃຈທີ່ໃຊ້ບໍລິການ 🙏</p>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=400,height=600');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
  win.onafterprint = () => win.close();
}
