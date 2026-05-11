"use client";

import { Plus, Check, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/api";

interface Props {
  item: MenuItem;
  inCart: boolean;
  onAdd: () => void;
}

function formatRp(n: number | string) {
  return `₭${Number(n).toLocaleString('en-US')}`;
}

export function MenuItemCard({ item, inCart, onAdd }: Props) {
  const imageUrl = item.image_url ?? item.imge_url;

  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl p-3.5 border transition-all duration-150",
        "hover:-translate-y-0.5 hover:shadow-md",
        !item.is_available && "opacity-60",
        inCart && "border-primary/40 ring-1 ring-primary/20",
      )}
    >
      {/* availability badge */}
      {!item.is_available && (
        <div className="absolute inset-0 rounded-2xl bg-background/50 z-10 flex items-center justify-center">
          <Badge variant="secondary" className="gap-1.5 text-xs font-medium">
            <EyeOff size={11} />
            Sold Out
          </Badge>
        </div>
      )}

      {/* image / emoji */}
      <div className="rounded-xl bg-muted h-28 flex items-center justify-center mb-3 overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl select-none">🍽️</span>
        )}
      </div>

      <p className="font-semibold text-sm leading-snug line-clamp-1 mb-0.5">
        {item.name}
      </p>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
        {item.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="font-bold text-sm">{formatRp(item.price)}</span>
        <Button
          size="icon"
          variant={inCart ? "default" : "outline"}
          className={cn(
            "h-7 w-7 rounded-full transition-all",
            inCart && "bg-primary text-primary-foreground",
          )}
          onClick={onAdd}
          disabled={!item.is_available}
        >
          {inCart ? (
            <Check size={13} strokeWidth={2.5} />
          ) : (
            <Plus size={13} strokeWidth={2.5} />
          )}
        </Button>
      </div>
    </div>
  );
}
