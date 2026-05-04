// src/components/menu/CategoryTabs.tsx
"use client";

interface Props {
  categories: { id: string; name: string }[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function CategoryTabs({ categories, selected, onSelect }: Props) {
  return (
    <div className="border-t border-[#e8ede9]">
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all min-h-[36px] active:scale-95 ${
              selected === cat.id
                ? "bg-[#3a5a40] text-white shadow-sm shadow-[rgba(58,90,64,0.25)]"
                : "bg-white text-slate-500 border border-[#d1ddd3] active:bg-[#f0f5f1]"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
