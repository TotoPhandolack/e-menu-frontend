import type { Order } from './api';
import { BILL_CSS, buildBillModel, renderBillInner } from './bill';

/**
 * Print an 80mm thermal receipt for an order.
 *
 * The layout and stylesheet are shared with the on-screen <BillReceipt> component
 * (see src/lib/bill.ts), so the printout matches the preview exactly. The receipt
 * is written into a hidden iframe; we wait for its web fonts to load before firing
 * print so Lao glyphs never fall back to a boxy system face.
 */
export function printBill(order: Order, restaurantName: string): Promise<void> {
  return new Promise((resolve) => {
    const model = buildBillModel(order, restaurantName);

    const html = `<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="UTF-8"/>
  <title>Bill — ${model.restaurantName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;700&family=Outfit:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: #fff; }
    body { width: 80mm; margin: 0 auto; padding: 4mm 2mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    /* Print variant of the receipt: full paper width, no card chrome. */
    .bill { width: 100% !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; }
    @media print { body { width: 100%; } }
    ${BILL_CSS}
  </style>
</head>
<body>
  <div class="bill">${renderBillInner(model)}</div>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:none;visibility:hidden;';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      resolve();
      return;
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    const iframeWin = iframe.contentWindow!;
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      if (iframe.parentNode) document.body.removeChild(iframe);
      resolve();
    };

    iframeWin.onafterprint = cleanup;

    let printed = false;
    const fire = () => {
      if (printed) return;
      printed = true;
      iframeWin.focus();
      iframeWin.print();
      // Fallback: some browsers don't emit onafterprint (or the dialog is dismissed
      // without it). Reap the iframe after a grace period so it never leaks.
      setTimeout(cleanup, 60_000);
    };

    // Fire once fonts are ready; hard-cap the wait so a slow/failed font load
    // never blocks printing.
    iframeDoc.fonts?.ready?.then(() => setTimeout(fire, 80));
    setTimeout(fire, 1500);
  });
}
