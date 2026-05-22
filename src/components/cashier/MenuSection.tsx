"use client";

import { useState, useMemo } from "react";
import { LayoutGrid, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MenuItemCard } from "./MenuItemCard";
import type { MenuItem } from "@/lib/api";

interface Props {
  items: MenuItem[];
  loading: boolean;
  cartItemIds: Set<string>;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuSection({
  items,
  loading,
  cartItemIds,
  onAddToCart,
}: Props) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    items.forEach((item) => {
      const cat = item.category;
      if (!map.has(cat.id))
        map.set(cat.id, { id: cat.id, name: cat.name, count: 0 });
      map.get(cat.id)!.count++;
    });
    return [
      { id: "all", name: "All Menu", count: items.length },
      ...Array.from(map.values()),
    ];
  }, [items]);

  const filtered = useMemo(() => {
    let base =
      activeCategory === "all"
        ? items
        : items.filter((i) => i.category.id === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter((i) => i.name.toLowerCase().includes(q));
    }
    return base;
  }, [items, activeCategory, search]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-w-0 min-h-0">
      {/* category tabs + search — stacked on mobile, side-by-side on md+ */}
      <div className="bg-background border-b px-4 md:px-7 py-3 md:py-3.5 flex flex-col md:flex-row md:items-center gap-2 md:gap-3 shrink-0">
        {/* scrollable category pills */}
        <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-none flex-1">
          {categories.map(({ id, name, count }) => {
            const active = activeCategory === id;
            return (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl border-2 transition-all duration-150 text-left",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/40",
                )}
              >
                <LayoutGrid size={14} strokeWidth={1.8} className="shrink-0" />
                <div>
                  <p className="font-semibold text-[12px] md:text-[13px] leading-none">
                    {name}
                  </p>
                  <p className="text-[10px] md:text-[11px] opacity-70 mt-0.5">{count} items</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* search — full width on mobile, fixed width on md+ */}
        <div className="relative">
          <Search
            size={14}
            strokeWidth={2}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 w-full md:w-48 text-sm"
          />
        </div>
      </div>

      {/* product grid — scrollable */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 md:p-7">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-44 md:h-52 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <LayoutGrid size={36} strokeWidth={1.2} />
              <p className="text-sm">
                {search.trim()
                  ? "No items match your search"
                  : "No items in this category"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 md:gap-4">
              {filtered.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  inCart={cartItemIds.has(item.id)}
                  onAdd={() => onAddToCart(item)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
