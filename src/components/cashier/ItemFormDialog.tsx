"use client";

import { useState, useRef, useEffect } from "react";
import { ImagePlus, Link, Upload, Utensils, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  createMenuItem,
  updateMenuItem,
  uploadMenuItemImage,
  type MenuItem,
  type CreateMenuItemPayload,
} from "@/lib/api";

export interface CategoryOption {
  id: string;
  name: string;
}

interface Props {
  /** null = create mode, MenuItem = edit mode */
  item: MenuItem | null;
  open: boolean;
  restaurantId: string;
  categories: CategoryOption[];
  onClose: () => void;
  onSaved: (item: MenuItem, isNew: boolean) => void;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  category_id: string;
}

const EMPTY: FormState = { name: "", description: "", price: "", category_id: "" };

export function ItemFormDialog({
  item,
  open,
  restaurantId,
  categories,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!item;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [imgTab, setImgTab] = useState<"upload" | "url">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Pre-fill form when editing
  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          name: item.name,
          description: item.description ?? "",
          price: String(item.price),
          category_id: item.category.id,
        });
        setUrlInput(item.imge_url ?? item.image_url ?? "");
      } else {
        setForm({ ...EMPTY, category_id: categories[0]?.id ?? "" });
        setUrlInput("");
      }
      setFile(null);
      setFilePreview(null);
      setImgTab("upload");
    }
  }, [open, item, categories]);

  function handleClose() {
    setSaving(false);
    onClose();
  }

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleFileChange(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Only image files are allowed"); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error("File must be under 5 MB"); return; }
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  }

  function validate() {
    if (!form.name.trim()) { toast.error("Name is required"); return false; }
    if (!form.description.trim()) { toast.error("Description is required"); return false; }
    const p = parseFloat(form.price);
    if (isNaN(p) || p < 0) { toast.error("Enter a valid price"); return false; }
    if (!form.category_id) { toast.error("Select a category"); return false; }
    return true;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);

    const price = parseFloat(form.price);

    // Determine the image URL to use from the URL tab (if any)
    const newUrlImage = imgTab === "url" && urlInput.trim() ? urlInput.trim() : undefined;

    try {
      let saved: MenuItem;

      if (!isEdit) {
        // ── CREATE ──
        const payload: CreateMenuItemPayload = {
          restaurant_id: restaurantId,
          category_id: form.category_id,
          name: form.name.trim(),
          description: form.description.trim(),
          price,
          ...(newUrlImage ? { imge_url: newUrlImage } : {}),
        };
        const { data } = await createMenuItem(payload);
        saved = data;

        // If a file was chosen, upload it now
        if (imgTab === "upload" && file) {
          const { data: withImg } = await uploadMenuItemImage(saved.id, file);
          saved = withImg;
        }
      } else {
        // ── EDIT ──
        const updates: Parameters<typeof updateMenuItem>[1] = {
          name: form.name.trim(),
          description: form.description.trim(),
          price,
          category_id: form.category_id,
          ...(newUrlImage ? { imge_url: newUrlImage } : {}),
        };
        const { data } = await updateMenuItem(item!.id, updates);
        saved = data;

        // Upload new file if chosen
        if (imgTab === "upload" && file) {
          const { data: withImg } = await uploadMenuItemImage(saved.id, file);
          saved = withImg;
        }
      }

      onSaved(saved, !isEdit);
      toast.success(isEdit ? "Item updated" : "Item created");
      handleClose();
    } catch {
      toast.error("Failed to save item");
    } finally {
      setSaving(false);
    }
  }

  const currentImage = item?.image_url ?? item?.imge_url ?? null;
  const uploadPreview = filePreview ?? (imgTab === "upload" ? currentImage : null);
  const urlPreview = urlInput.trim() || (imgTab === "url" ? currentImage ?? "" : "");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit — ${item!.name}` : "New Menu Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="item-name">Name *</Label>
            <Input
              id="item-name"
              placeholder="e.g. Green Papaya Salad"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="item-desc">Description *</Label>
            <Textarea
              id="item-desc"
              placeholder="Short description shown on the menu"
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="item-price">Price (₭) *</Label>
              <Input
                id="item-price"
                type="number"
                min={0}
                step={500}
                placeholder="0"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.category_id} onValueChange={(v) => set("category_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Image */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <ImagePlus size={13} />
              Image <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>

            <Tabs value={imgTab} onValueChange={(v) => setImgTab(v as "upload" | "url")}>
              <TabsList className="w-full">
                <TabsTrigger value="upload" className="flex-1 gap-1.5">
                  <Upload size={12} /> Upload File
                </TabsTrigger>
                <TabsTrigger value="url" className="flex-1 gap-1.5">
                  <Link size={12} /> Paste URL
                </TabsTrigger>
              </TabsList>

              {/* Upload tab */}
              <TabsContent value="upload" className="mt-3">
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFileChange(e.dataTransfer.files[0] ?? null);
                  }}
                  className={cn(
                    "relative h-36 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden",
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/40",
                  )}
                >
                  {uploadPreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={uploadPreview} alt="preview" className="w-full h-full object-cover" />
                      {file && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setFile(null); setFilePreview(null); }}
                          className="absolute top-2 right-2 bg-background/80 rounded-full p-0.5 hover:bg-background"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                      <Utensils size={24} strokeWidth={1.2} />
                      <p className="text-xs font-medium">Click or drag image</p>
                      <p className="text-[11px]">PNG, JPG, WEBP · max 5 MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
              </TabsContent>

              {/* URL tab */}
              <TabsContent value="url" className="mt-3 space-y-3">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                {urlPreview && (
                  <div className="h-36 rounded-xl overflow-hidden border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={urlPreview}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-3">
          <Button variant="outline" className="flex-1" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Item"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
