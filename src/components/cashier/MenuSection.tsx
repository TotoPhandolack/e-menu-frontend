'use client';

import { useState, useMemo } from 'react';
import { LayoutGrid } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MenuItemCard } from './MenuItemCard';
import type { MenuItem } from '@/lib/api';

interface Props {
  items: MenuItem[];
  loading: boolean;
  cartItemIds: Set<string>;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuSection({ items, loading, cartItemIds, onAddToCart }: Props) {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    items.forEach((item) => {
      const cat = item.category;
      if (!map.has(cat.id)) map.set(cat.id, { id: cat.id, name: cat.name, count: 0 });
      map.get(cat.id)!.count++;
    });
    return [
      { id: 'all', name: 'All Menu', count: items.length },
      ...Array.from(map.values()),
    ];
  }, [items]);

  const filtered = useMemo(
    () => (activeCategory === 'all' ? items : items.filter((i) => i.category.id === activeCategory)),
    [items, activeCategory],
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-w-0">
      {/* category tabs */}
      <div className="bg-background border-b px-7 py-3.5 flex gap-3 overflow-x-auto scrollbar-none shrink-0">
        {categories.map(({ id, name, count }) => {
          const active = activeCategory === id;
          return (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={cn(
                'shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all duration-150 text-left',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:border-primary/40',
              )}
            >
              <LayoutGrid size={16} strokeWidth={1.8} />
              <div>
                <p className="font-semibold text-[13px] leading-none">{name}</p>
                <p className="text-[11px] opacity-70 mt-0.5">{count} items</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* product grid */}
      <ScrollArea className="flex-1">
        <div className="p-7">
          {loading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <LayoutGrid size={36} strokeWidth={1.2} />
              <p className="text-sm">No items in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
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
