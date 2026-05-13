"use client";

import { useState, useCallback } from "react";
import QRCode from "react-qr-code";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  X,
  LayoutGrid,
  QrCode,
  Download,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  type TableInfo,
  createTable,
  updateTable,
  deleteTable,
  type CreateTablePayload,
} from "@/lib/api";

// ── QR URL helper ────────────────────────────────────────────────────────────
function buildQrUrl(token: string): string {
  // Use explicit env var when set, otherwise fall back to current origin
  const base =
    process.env.NEXT_PUBLIC_FRONTEND_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/menu?token=${token}`;
}

interface Props {
  tables: TableInfo[];
  loading: boolean;
  restaurantId: string;
  onRefresh: () => void;
  onTableCreated: (table: TableInfo) => void;
  onTableUpdated: (table: TableInfo) => void;
  onTableDeleted: (id: string) => void;
}

interface TableFormState {
  table_number: string;
  capacity: string;
}

const defaultForm: TableFormState = { table_number: "", capacity: "2" };

export function TableManageTab({
  tables,
  loading,
  restaurantId,
  onRefresh,
  onTableCreated,
  onTableUpdated,
  onTableDeleted,
}: Props) {
  const [search, setSearch] = useState("");

  // Form dialog (create / edit)
  const [formOpen, setFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableInfo | null>(null);
  const [form, setForm] = useState<TableFormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm dialog
  const [deletingTable, setDeletingTable] = useState<TableInfo | null>(null);
  const [deleting, setDeleting] = useState(false);

  // QR preview dialog (shown after create)
  const [qrPreview, setQrPreview] = useState<{ token: string; tableNumber: string } | null>(null);

  const filtered = search.trim()
    ? tables.filter((t) =>
        t.table_number.toLowerCase().includes(search.toLowerCase()),
      )
    : tables;

  // ── open helpers ──────────────────────────────────────────────────────────
  function openCreate() {
    setEditingTable(null);
    setForm(defaultForm);
    setFormOpen(true);
  }

  function openEdit(table: TableInfo) {
    setEditingTable(table);
    setForm({
      table_number: table.table_number,
      capacity: String(table.capacity),
    });
    setFormOpen(true);
  }

  // ── duplicate check ───────────────────────────────────────────────────────
  function isDuplicateTableNumber(number: string, excludeId?: string): boolean {
    const norm = number.trim().toLowerCase();
    return tables.some(
      (t) => t.table_number.toLowerCase() === norm && t.id !== excludeId,
    );
  }

  // ── submit (create or update) ─────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tableNumber = form.table_number.trim();
    const cap = parseInt(form.capacity, 10);

    if (!tableNumber) {
      toast.error("Table number is required");
      return;
    }
    if (isNaN(cap) || cap < 1) {
      toast.error("Capacity must be at least 1");
      return;
    }

    // ── duplicate table number guard ─────────────────────────────────────
    if (isDuplicateTableNumber(tableNumber, editingTable?.id)) {
      toast.warning(`Table number "${tableNumber}" already exists. Please use a different number.`);
      return;
    }

    setSubmitting(true);
    try {
      if (editingTable) {
        // UPDATE
        const res = await updateTable(editingTable.id, {
          table_number: tableNumber,
          capacity: cap,
        });
        onTableUpdated(res.data);
        toast.success(`Table "${res.data.table_number}" updated`);
        setFormOpen(false);
      } else {
        // CREATE
        const payload: CreateTablePayload = {
          restaurant_id: restaurantId,
          table_number: tableNumber,
          capacity: cap,
        };
        const res = await createTable(payload);
        onTableCreated(res.data);
        toast.success(`Table "${res.data.table_number}" created`);
        setFormOpen(false);
        // Show QR preview using token from response
        setQrPreview({
          token: res.data.qr_code_token,
          tableNumber: res.data.table_number,
        });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save table";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deletingTable) return;
    if (deletingTable.status === "OCCUPIED") {
      toast.error("Cannot delete an occupied table — clear it first");
      setDeletingTable(null);
      return;
    }
    setDeleting(true);
    try {
      await deleteTable(deletingTable.id);
      onTableDeleted(deletingTable.id);
      toast.success(`Table "${deletingTable.table_number}" removed`);
    } catch {
      toast.error("Failed to delete table");
    } finally {
      setDeleting(false);
      setDeletingTable(null);
    }
  }

  // ── QR download (SVG → PNG via canvas) ───────────────────────────────────
  const downloadQR = useCallback((token: string, tableNumber: string) => {
    const svg = document.getElementById(`qr-svg-${token}`);
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.download = `table-${tableNumber}-qr.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      {/* ── Toolbar ── */}
      <div className="bg-background border-b px-7 py-3.5 flex items-center gap-3 shrink-0">
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onRefresh} className="gap-1.5">
            <RefreshCw size={13} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus size={13} />
            Add Table
          </Button>
        </div>

        <p className="text-sm text-muted-foreground shrink-0">
          {filtered.length}/{tables.length}
        </p>

        {/* search */}
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Search tables…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-8 h-9 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-7">
          {loading ? (
            <div className="grid grid-cols-5 gap-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
              <LayoutGrid size={36} strokeWidth={1.2} />
              {search.trim() ? (
                <>
                  <p className="text-sm">No tables match &ldquo;{search}&rdquo;</p>
                  <button
                    onClick={() => setSearch("")}
                    className="text-sm text-primary font-medium"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm">No tables yet</p>
                  <Button size="sm" onClick={openCreate} className="gap-1.5">
                    <Plus size={13} /> Add first table
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-5">
              {filtered.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  onEdit={() => openEdit(table)}
                  onDelete={() => setDeletingTable(table)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── Add / Edit dialog ── */}
      <Dialog open={formOpen} onOpenChange={(v) => !submitting && setFormOpen(v)}>
        <DialogContent
          aria-describedby="table-form-desc"
          className={cn(editingTable && "sm:max-w-md")}
        >
          <DialogHeader>
            <DialogTitle>
              {editingTable
                ? `Edit Table "${editingTable.table_number}"`
                : "Add New Table"}
            </DialogTitle>
            <DialogDescription id="table-form-desc">
              {editingTable
                ? "Update table details. The QR code below is linked to this table's token."
                : "A QR code will be generated automatically after creation."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* QR code section — only shown in edit mode */}
            {editingTable && (
              <div className="flex flex-col items-center gap-3 py-3 border rounded-xl bg-muted/30">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <QRCode
                    id={`qr-svg-${editingTable.qr_code_token}`}
                    value={buildQrUrl(editingTable.qr_code_token)}
                    size={160}
                    level="M"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 justify-center">
                    <QrCode size={11} />
                    Scan to open table menu
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 font-mono break-all px-4">
                    {buildQrUrl(editingTable.qr_code_token)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-7 text-xs"
                  onClick={() =>
                    downloadQR(editingTable.qr_code_token, editingTable.table_number)
                  }
                >
                  <Download size={12} />
                  Download QR
                </Button>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="table-number">Table Number</Label>
              <Input
                id="table-number"
                placeholder="e.g. A1, 12, VIP-1"
                value={form.table_number}
                onChange={(e) => setForm((f) => ({ ...f, table_number: e.target.value }))}
                autoFocus={!editingTable}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="capacity">Capacity (seats)</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={50}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                required
              />
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? editingTable
                    ? "Saving…"
                    : "Creating…"
                  : editingTable
                    ? "Save Changes"
                    : "Create Table"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm dialog ── */}
      <Dialog
        open={!!deletingTable}
        onOpenChange={(v) => !deleting && !v && setDeletingTable(null)}
      >
        <DialogContent aria-describedby="del-table-desc">
          <DialogHeader>
            <DialogTitle>
              Remove Table &ldquo;{deletingTable?.table_number}&rdquo;?
            </DialogTitle>
            <DialogDescription id="del-table-desc">
              {deletingTable?.status === "OCCUPIED"
                ? "⚠️ This table is currently OCCUPIED. Clear it before deleting."
                : "The table will be deactivated and hidden from orders."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeletingTable(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || deletingTable?.status === "OCCUPIED"}
            >
              {deleting ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── QR preview dialog (after create) ── */}
      <Dialog open={!!qrPreview} onOpenChange={(v) => !v && setQrPreview(null)}>
        <DialogContent
          aria-describedby="qr-preview-desc"
          className="sm:max-w-sm text-center"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <QrCode size={18} />
              Table &ldquo;{qrPreview?.tableNumber}&rdquo; QR Code
            </DialogTitle>
            <DialogDescription id="qr-preview-desc">
              Print or download this QR code and place it on the table.
            </DialogDescription>
          </DialogHeader>

          {qrPreview && (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-white rounded-xl border shadow-sm">
                <QRCode
                  id={`qr-svg-${qrPreview.token}`}
                  value={buildQrUrl(qrPreview.token)}
                  size={180}
                  level="M"
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-mono break-all px-4">
                {buildQrUrl(qrPreview.token)}
              </p>
            </div>
          )}

          <DialogFooter className="justify-center gap-2 sm:gap-2 flex-row">
            <Button variant="outline" onClick={() => setQrPreview(null)}>
              Close
            </Button>
            {qrPreview && (
              <Button
                onClick={() => downloadQR(qrPreview.token, qrPreview.tableNumber)}
                className="gap-1.5"
              >
                <Download size={14} />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── TableCard ────────────────────────────────────────────────────────────────
function TableCard({
  table,
  onEdit,
  onDelete,
}: {
  table: TableInfo;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const occupied = table.status === "OCCUPIED";

  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl border flex flex-col overflow-hidden transition-all hover:shadow-md",
        occupied && "border-amber-400/60 bg-amber-50/30 dark:bg-amber-950/20",
      )}
    >
      {/* Status bar */}
      <div
        className={cn(
          "h-1.5 w-full shrink-0",
          occupied ? "bg-amber-400" : "bg-emerald-500",
        )}
      />

      {/* Body */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Table number */}
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-3xl leading-none tracking-tight">
            {table.table_number}
          </p>
          <Badge
            variant={occupied ? "default" : "secondary"}
            className={cn(
              "text-[11px] px-2 py-0.5 shrink-0",
              occupied
                ? "bg-amber-500/20 text-amber-700 border-amber-400/40 dark:text-amber-300"
                : "bg-emerald-500/15 text-emerald-700 border-emerald-400/30 dark:text-emerald-400",
            )}
          >
            {occupied ? "Occupied" : "Available"}
          </Badge>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users size={15} />
          <span className="text-sm">{table.capacity} seats</span>
        </div>
      </div>

      {/* Hover action overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all rounded-2xl">
        <button
          onClick={onEdit}
          className="bg-background/90 rounded-full p-2 shadow hover:bg-background"
          title="Edit table"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          className="bg-background/90 rounded-full p-2 shadow hover:bg-destructive hover:text-destructive-foreground"
          title="Remove table"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
