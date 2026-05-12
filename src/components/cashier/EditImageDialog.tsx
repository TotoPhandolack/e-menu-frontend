"use client";

import { useState, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { uploadMenuItemImage, updateMenuItem, type MenuItem } from "@/lib/api";

interface Props {
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: MenuItem) => void;
}

export function EditImageDialog({ item, open, onClose, onSaved }: Props) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const currentImage = item?.image_url ?? item?.imge_url ?? null;

  function handleClose() {
    setFile(null);
    setFilePreview(null);
    setUrlInput("");
    setSaving(false);
    onClose();
  }

  function handleFileChange(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB");
      return;
    }
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  }

  async function handleSave() {
    if (!item) return;
    setSaving(true);
    try {
      if (tab === "upload") {
        if (!file) { toast.error("Please select a file"); return; }
        const { data } = await uploadMenuItemImage(item.id, file);
        onSaved(data);
        toast.success("Image uploaded");
      } else {
        const url = urlInput.trim();
        if (!url) { toast.error("Please enter a URL"); return; }
        const { data } = await updateMenuItem(item.id, { imge_url: url });
        onSaved(data);
        toast.success("Image URL saved");
      }
      handleClose();
    } catch {
      toast.error("Failed to save image");
    } finally {
      setSaving(false);
    }
  }

  const uploadPreview = filePreview ?? (tab === "upload" ? currentImage : null);
  const urlPreview = urlInput.trim() || currentImage;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus size={16} />
            Edit Image — {item?.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "upload" | "url")}>
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1 gap-1.5">
              <Upload size={13} />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="flex-1 gap-1.5">
              <Link size={13} />
              Paste URL
            </TabsTrigger>
          </TabsList>

          {/* ── Upload tab ── */}
          <TabsContent value="upload" className="mt-4 space-y-4">
            {/* Drop zone */}
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
                "relative h-44 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden",
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
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
                      <X size={14} />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Utensils size={28} strokeWidth={1.2} />
                  <p className="text-sm font-medium">Click or drag an image here</p>
                  <p className="text-xs">PNG, JPG, WEBP · max 5 MB</p>
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

          {/* ── URL tab ── */}
          <TabsContent value="url" className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="img-url">Image URL</Label>
              <Input
                id="img-url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
            </div>
            {urlPreview && (
              <div className="h-44 rounded-xl overflow-hidden border bg-muted">
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

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Image"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
