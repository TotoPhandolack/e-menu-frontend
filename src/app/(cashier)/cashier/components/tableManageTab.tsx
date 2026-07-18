"use client";

import { useState, useCallback, useMemo } from "react";
import QRCode from "react-qr-code";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  X,
  LayoutGrid,
  QrCode,
  Download,
  Users,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "react-toastify";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MdOutlineTableBar } from "react-icons/md";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";
import { Switch } from "@/components/ui/switch";
import {
  type TableInfo,
  createTable,
  updateTable,
  deleteTable,
  cashierOpenTable,
  cashierSetTableAvailable,
  type CreateTablePayload,
} from "@/lib/api";

// ── QR URL helper ────────────────────────────────────────────────────────────
function buildQrUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_FRONTEND_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/menu?token=${token}`;
}

// ── Sort options ─────────────────────────────────────────────────────────────
type SortOption = "number-asc" | "number-desc" | "alpha-asc" | "alpha-desc";

function sortTables(tables: TableInfo[], sort: SortOption): TableInfo[] {
  return [...tables].sort((a, b) => {
    switch (sort) {
      case "number-asc": {
        const na = parseInt(a.table_number) || 0;
        const nb = parseInt(b.table_number) || 0;
        return na !== nb ? na - nb : a.table_number.localeCompare(b.table_number);
      }
      case "number-desc": {
        const na = parseInt(a.table_number) || 0;
        const nb = parseInt(b.table_number) || 0;
        return na !== nb ? nb - na : b.table_number.localeCompare(a.table_number);
      }
      case "alpha-asc":
        return a.table_number.localeCompare(b.table_number, undefined, { numeric: true });
      case "alpha-desc":
        return b.table_number.localeCompare(a.table_number, undefined, { numeric: true });
      default:
        return 0;
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────
interface Props {
  tables: TableInfo[];
  loading: boolean;
  restaurantId: string;
  onRefresh: () => void;
  onTableCreated: (table: TableInfo) => void;
  onTableUpdated: (table: TableInfo) => void;
  onTableDeleted: (id: string) => void;
}

type TogglingMap = Record<string, boolean>;

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
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("number-asc");
  const [toggling, setToggling] = useState<TogglingMap>({});

  // Form dialog (create / edit)
  const [formOpen, setFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableInfo | null>(null);
  const [form, setForm] = useState<TableFormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm dialog
  const [deletingTable, setDeletingTable] = useState<TableInfo | null>(null);
  const [deleting, setDeleting] = useState(false);

  // QR view/preview dialog
  const [qrPreview, setQrPreview] = useState<{ token: string; tableNumber: string } | null>(null);

  // Filtered + sorted list
  const displayed = useMemo(() => {
    const base = search.trim()
      ? tables.filter((t) =>
          t.table_number.toLowerCase().includes(search.toLowerCase()),
        )
      : tables;
    return sortTables(base, sort);
  }, [tables, search, sort]);

  // ── open helpers ──────────────────────────────────────────────────────────
  function openCreate() {
    setEditingTable(null);
    setForm(defaultForm);
    setFormOpen(true);
  }

  function openEdit(table: TableInfo) {
    setEditingTable(table);
    setForm({ table_number: table.table_number, capacity: String(table.capacity) });
    setFormOpen(true);
  }

  function openView(table: TableInfo) {
    setQrPreview({ token: table.qr_code_token, tableNumber: table.table_number });
  }

  // ── status toggle ─────────────────────────────────────────────────────────
  async function handleToggleStatus(table: TableInfo) {
    if (toggling[table.id]) return;
    setToggling((prev) => ({ ...prev, [table.id]: true }));
    try {
      const isOccupied = table.status === "OCCUPIED";
      const res = isOccupied
        ? await cashierSetTableAvailable(table.id)
        : await cashierOpenTable(table.id);
      onTableUpdated(res.data);
      toast.success(
        t.cashier.table.toasts.tableMarked(table.table_number, isOccupied),
      );
    } catch {
      toast.error(t.cashier.table.toasts.statusFailed);
    } finally {
      setToggling((prev) => ({ ...prev, [table.id]: false }));
    }
  }

  // ── duplicate check ───────────────────────────────────────────────────────
  function isDuplicate(number: string, excludeId?: string): boolean {
    const norm = number.trim().toLowerCase();
    return tables.some((t) => t.table_number.toLowerCase() === norm && t.id !== excludeId);
  }

  // ── submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tableNumber = form.table_number.trim();
    const cap = parseInt(form.capacity, 10);

    if (!tableNumber) { toast.error(t.cashier.table.toasts.enterNumber); return; }
    if (isNaN(cap) || cap < 1) { toast.error(t.cashier.table.toasts.capacityMin); return; }
    if (isDuplicate(tableNumber, editingTable?.id)) {
      toast.warning(t.cashier.table.toasts.numberExists(tableNumber));
      return;
    }

    setSubmitting(true);
    try {
      if (editingTable) {
        const res = await updateTable(editingTable.id, { table_number: tableNumber, capacity: cap });
        onTableUpdated(res.data);
        toast.success(t.cashier.table.toasts.updated(res.data.table_number));
        setFormOpen(false);
      } else {
        const payload: CreateTablePayload = { restaurant_id: restaurantId, table_number: tableNumber, capacity: cap };
        const res = await createTable(payload);
        onTableCreated(res.data);
        toast.success(t.cashier.table.toasts.created(res.data.table_number));
        setFormOpen(false);
        setQrPreview({ token: res.data.qr_code_token, tableNumber: res.data.table_number });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t.cashier.table.toasts.saveFailed;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deletingTable) return;
    if (deletingTable.status === "OCCUPIED") {
      toast.error(t.cashier.table.toasts.cannotDeleteOccupied);
      setDeletingTable(null);
      return;
    }
    setDeleting(true);
    try {
      await deleteTable(deletingTable.id);
      onTableDeleted(deletingTable.id);
      toast.success(t.cashier.table.toasts.deleted(deletingTable.table_number));
    } catch {
      toast.error(t.cashier.table.toasts.deleteFailed);
    } finally {
      setDeleting(false);
      setDeletingTable(null);
    }
  }

  // ── QR download (SVG → PNG) ───────────────────────────────────────────────
  const downloadQR = useCallback((token: string, tableNumber: string) => {
    const svg = document.getElementById(`qr-svg-${token}`);
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const img = new Image();
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512; canvas.height = 512;
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
        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onRefresh} className="gap-1.5">
            <RefreshCw size={13} />
            {t.common.refresh}
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus size={13} />
            {t.cashier.table.addTable}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground shrink-0">
          {displayed.length}/{tables.length}
        </p>

        {/* Sort */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown size={13} className="text-muted-foreground" />
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="h-9 text-sm w-44 gap-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number-asc">{t.cashier.table.sortNumberAsc}</SelectItem>
              <SelectItem value="number-desc">{t.cashier.table.sortNumberDesc}</SelectItem>
              <SelectItem value="alpha-asc">{t.cashier.table.sortAlphaAsc}</SelectItem>
              <SelectItem value="alpha-desc">{t.cashier.table.sortAlphaDesc}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={t.cashier.table.searchPlaceholder}
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
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
              <LayoutGrid size={36} strokeWidth={1.2} />
              {search.trim() ? (
                <>
                  <p className="text-sm">{t.cashier.table.noMatch(search)}</p>
                  <button onClick={() => setSearch("")} className="text-sm text-primary font-medium">
                    {t.common.clearSearch}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm">{t.cashier.table.noTablesYet}</p>
                  <Button size="sm" onClick={openCreate} className="gap-1.5">
                    <Plus size={13} /> {t.cashier.table.addFirstTable}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-5">
              {displayed.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  toggling={toggling[table.id] ?? false}
                  onView={() => openView(table)}
                  onEdit={() => openEdit(table)}
                  onDelete={() => setDeletingTable(table)}
                  onToggleStatus={() => handleToggleStatus(table)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── Add / Edit dialog ── */}
      <Dialog open={formOpen} onOpenChange={(v) => !submitting && setFormOpen(v)}>
        <DialogContent aria-describedby="table-form-desc" className={cn(editingTable && "sm:max-w-md")}>
          <DialogHeader>
            <DialogTitle>
              {editingTable ? t.cashier.table.editTitle(editingTable.table_number) : t.cashier.table.addTitle}
            </DialogTitle>
            <DialogDescription id="table-form-desc">
              {editingTable
                ? t.cashier.table.editDesc
                : t.cashier.table.addDesc}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* QR section — edit mode only */}
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
                    <QrCode size={11} /> {t.cashier.table.scanToOpen}
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
                  onClick={() => downloadQR(editingTable.qr_code_token, editingTable.table_number)}
                >
                  <Download size={12} /> {t.cashier.table.downloadQR}
                </Button>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="table-number">{t.cashier.table.tableNumber}</Label>
              <Input
                id="table-number"
                placeholder={t.cashier.table.tableNumberPlaceholder}
                value={form.table_number}
                onChange={(e) => setForm((f) => ({ ...f, table_number: e.target.value }))}
                autoFocus={!editingTable}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="capacity">{t.cashier.table.capacity}</Label>
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
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={submitting}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? editingTable ? t.common.saving : t.common.creating
                  : editingTable ? t.common.saveChanges : t.cashier.table.createTable}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm dialog ── */}
      <Dialog open={!!deletingTable} onOpenChange={(v) => !deleting && !v && setDeletingTable(null)}>
        <DialogContent aria-describedby="del-table-desc">
          <DialogHeader>
            <DialogTitle>{t.cashier.table.removeTitle(deletingTable?.table_number ?? "")}</DialogTitle>
            <DialogDescription id="del-table-desc">
              {deletingTable?.status === "OCCUPIED"
                ? t.cashier.table.removeOccupiedDesc
                : t.cashier.table.removeDesc}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingTable(null)} disabled={deleting}>
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || deletingTable?.status === "OCCUPIED"}
            >
              {deleting ? t.common.removing : t.common.remove}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── QR view dialog (view button + after create) ── */}
      <Dialog open={!!qrPreview} onOpenChange={(v) => !v && setQrPreview(null)}>
        <DialogContent aria-describedby="qr-view-desc" className="sm:max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <QrCode size={18} />
              {t.cashier.table.qrTitle(qrPreview?.tableNumber ?? "")}
            </DialogTitle>
            <DialogDescription id="qr-view-desc">
              {t.cashier.table.qrDesc}
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
              {t.common.close}
            </Button>
            {qrPreview && (
              <Button
                onClick={() => downloadQR(qrPreview.token, qrPreview.tableNumber)}
                className="gap-1.5"
              >
                <Download size={14} /> {t.common.download}
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
  toggling,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  table: TableInfo;
  toggling: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const t = useTranslations();
  const occupied = table.status === "OCCUPIED";

  return (
    <div
      className={cn(
        "group bg-card rounded-2xl border flex flex-col overflow-hidden transition-all hover:shadow-md",
        occupied && "border-amber-400/60 bg-amber-50/30 dark:bg-amber-950/20",
      )}
    >
      {/* Status bar */}
      <div className={cn("h-1.5 w-full shrink-0", occupied ? "bg-amber-400" : "bg-emerald-500")} />

      {/* Body (hoverable area with overlay) */}
      <div className="relative p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5">
            <MdOutlineTableBar size={22} className="text-muted-foreground" />
            <p className="font-bold text-3xl leading-none tracking-tight">{table.table_number}</p>
          </div>
          <Badge
            variant={occupied ? "default" : "secondary"}
            className={cn(
              "text-[11px] px-2 py-0.5 shrink-0",
              occupied
                ? "bg-amber-500/20 text-amber-700 border-amber-400/40 dark:text-amber-300"
                : "bg-emerald-500/15 text-emerald-700 border-emerald-400/30 dark:text-emerald-400",
            )}
          >
            {occupied ? t.cashier.table.notAvailable : t.cashier.table.available}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Users size={15} />
          <span className="text-sm">{t.cashier.table.seats(table.capacity)}</span>
        </div>

        {/* Hover action overlay — View, Edit, Delete */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all rounded-t-2xl">
          <button
            onClick={onView}
            className="bg-background/90 rounded-full p-2 shadow hover:bg-background"
            title={t.cashier.table.viewQR}
          >
            <Eye size={13} />
          </button>
          <button
            onClick={onEdit}
            className="bg-background/90 rounded-full p-2 shadow hover:bg-background"
            title={t.cashier.table.editTooltip}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onDelete}
            className="bg-background/90 rounded-full p-2 shadow hover:bg-destructive hover:text-destructive-foreground"
            title={t.cashier.table.removeTooltip}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Toggle footer — always visible, not covered by overlay */}
      <div className="border-t px-4 py-2.5 flex items-center justify-between bg-card rounded-b-2xl">
        <span className="text-xs text-muted-foreground">
          {occupied ? t.cashier.table.notAvailable : t.cashier.table.available}
        </span>
        <Switch
          checked={!occupied}
          onCheckedChange={onToggleStatus}
          disabled={toggling}
          title={occupied ? t.cashier.table.markAvailable : t.cashier.table.markNotAvailable}
        />
      </div>
    </div>
  );
}
