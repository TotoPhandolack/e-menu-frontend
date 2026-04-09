// src/components/menu/CategoryTabs.tsx
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
    <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b no-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
            selected === cat.id
              ? "bg-yellow-400 text-slate-900 font-semibold"
              : "bg-slate-100 text-slate-600 hover:bg-yellow-100"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
