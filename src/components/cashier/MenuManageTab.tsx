"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Utensils, EyeOff, RefreshCw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ItemFormDialog, type CategoryOption } from "./ItemFormDialog";
import { getCategories, deleteMenuItem, resolveImageUrl, type MenuItem } from "@/lib/api";

interface Props {
  items: MenuItem[];
  loading: boolean;
  restaurantId: string;
  onRefresh: () => void;
  onItemCreated: (item: MenuItem) => void;
  onItemUpdated: (item: MenuItem) => void;
  onItemDeleted: (id: string) => void;
}

export function MenuManageTab({
  items,
  loading,
  restaurantId,
  onRefresh,
  onItemCreated,
  onItemUpdated,
  onItemDeleted,
}: Props) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = search.trim()
    ? items.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category.name.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  useEffect(() => {
    if (!restaurantId) return;
    getCategories(restaurantId)
      .then((r) => setCategories(r.data.map((c) => ({ id: c.id, name: c.name }))))
      .catch(() => toast.error("Failed to load categories"));
  }, [restaurantId]);

  function openCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditingItem(item);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await deleteMenuItem(deletingItem.id);
      onItemDeleted(deletingItem.id);
      toast.success(`"${deletingItem.name}" removed`);
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setDeleting(false);
      setDeletingItem(null);
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      {/* toolbar */}
      <div className="bg-background border-b px-7 py-3.5 flex items-center gap-3 shrink-0">
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onRefresh} className="gap-1.5">
            <RefreshCw size={13} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus size={13} />
            New Item
          </Button>
        </div>

        <p className="text-sm text-muted-foreground shrink-0">
          {filtered.length}/{items.length}
        </p>

        {/* search */}
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search items…"
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

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-7">
          {loading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-60 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
              <Utensils size={36} strokeWidth={1.2} />
              {search.trim() ? (
                <>
                  <p className="text-sm">No items match &ldquo;{search}&rdquo;</p>
                  <button onClick={() => setSearch("")} className="text-sm text-primary font-medium">
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm">No menu items yet</p>
                  <Button size="sm" onClick={openCreate} className="gap-1.5">
                    <Plus size={13} /> Add first item
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
              {filtered.map((item) => (
                <ManageItemCard
                  key={item.id}
                  item={item}
                  onEdit={() => openEdit(item)}
                  onDelete={() => setDeletingItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Item form — create or edit */}
      <ItemFormDialog
        item={editingItem}
        open={formOpen}
        restaurantId={restaurantId}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSaved={(saved, isNew) => {
          if (isNew) onItemCreated(saved);
          else onItemUpdated(saved);
        }}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deletingItem} onOpenChange={(v) => !v && setDeletingItem(null)}>
        <DialogContent aria-describedby="delete-desc">
          <DialogHeader>
            <DialogTitle>Remove &ldquo;{deletingItem?.name}&rdquo;?</DialogTitle>
            <DialogDescription id="delete-desc">
              This will hide the item from the customer menu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingItem(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ManageItemCard({
  item,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const imageUrl = resolveImageUrl(item.imge_url ?? item.image_url);

  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl border flex flex-col overflow-hidden transition-all hover:shadow-md",
        !item.is_available && "opacity-60",
      )}
    >
      {/* image */}
      <div className="relative h-32 bg-muted flex items-center justify-center overflow-hidden shrink-0">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <Utensils className="h-8 w-8 text-muted-foreground/30" />
        )}

        {/* action buttons overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={onEdit}
            className="bg-background/90 rounded-full p-2 shadow hover:bg-background"
            title="Edit item"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onDelete}
            className="bg-background/90 rounded-full p-2 shadow hover:bg-destructive hover:text-destructive-foreground"
            title="Remove item"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-semibold text-sm leading-snug line-clamp-1">{item.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{item.category.name}</p>
        <p className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed">{item.description}</p>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-bold text-sm">₭{Number(item.price).toLocaleString()}</span>
          {!item.is_available && (
            <Badge variant="secondary" className="gap-1 text-[10px] px-1.5">
              <EyeOff size={9} />
              Off
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
