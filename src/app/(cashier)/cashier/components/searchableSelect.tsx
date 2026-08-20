'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchableOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  options: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  onValueChange: (v: string) => void;
  className?: string;
  /** if true, the trigger shrinks to icon-only style (not used yet) */
}

export function SearchableSelect({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  onValueChange,
  className,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  function handleSelect(v: string) {
    onValueChange(v);
    setOpen(false);
    setQuery('');
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(''); }}>
      <PopoverPrimitive.Trigger asChild>
        <button
          ref={triggerRef}
          type="button"
          className={cn(
            'flex h-9 flex-1 items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-[13px] whitespace-nowrap transition-colors outline-none select-none',
            'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <span className={cn('line-clamp-1', !selected && 'text-muted-foreground')}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="pointer-events-none size-4 text-muted-foreground" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(
            'z-50 w-(--radix-popover-trigger-width) min-w-36 rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10',
            'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          )}
        >
          {/* sticky search */}
          <div className="flex items-center gap-2 border-b px-2.5 py-2">
            <Search className="size-3.5 text-muted-foreground shrink-0" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-7 border-0 px-0 shadow-none focus-visible:ring-0 text-[13px]"
            />
          </div>

          {/* list */}
          <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">{emptyText}</div>
            ) : (
              filtered.map((o) => {
                const active = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => handleSelect(o.value)}
                    className={cn(
                      'relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1.5 pr-8 pl-2 text-[13px] outline-none select-none',
                      'hover:bg-accent hover:text-accent-foreground',
                      active && 'bg-accent/60',
                    )}
                  >
                    <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                      {active && <Check className="pointer-events-none size-3.5" />}
                    </span>
                    <span className="line-clamp-1">{o.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
