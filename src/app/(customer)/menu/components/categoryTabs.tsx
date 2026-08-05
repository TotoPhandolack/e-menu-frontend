// src/app/(customer)/menu/components/categoryTabs.tsx
"use client";

interface Props {
  categories: { id: string; name: string }[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function CategoryTabs({
  categories,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="border-t border-border">
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all min-h-9 active:scale-95 ${selected === cat.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-muted-foreground border border-border active:bg-accent"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
