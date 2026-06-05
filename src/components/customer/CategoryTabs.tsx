// src/components/customer/CategoryTabs.tsx
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
    <div className="border-t border-primary/20">
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all min-h-9 active:scale-95 ${selected === cat.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-slate-500 border border-primary/30 active:bg-primary/10"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
