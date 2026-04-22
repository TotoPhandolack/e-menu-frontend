// src/components/menu/CategoryTabs.tsx
"use client";

interface Props {
  categories: { id: string; name: string }[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function CategoryTabs({ categories, selected, onSelect }: Props) {
  return (
    <div className="border-t border-slate-100">
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all min-h-[36px] active:scale-95 ${
              selected === cat.id
                ? "bg-amber-400 text-white shadow-sm shadow-amber-200"
                : "bg-white text-slate-500 border border-slate-200 active:bg-slate-50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
