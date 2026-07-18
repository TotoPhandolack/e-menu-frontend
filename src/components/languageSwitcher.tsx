"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { LANGUAGES, useLangStore, type LangCode } from "@/stores/langStore";
import { cn } from "@/lib/utils";

interface Props {
  /** Dropdown menu alignment relative to the trigger. */
  align?: "left" | "right";
  /** Extra classes for the wrapper (e.g. positioning). */
  className?: string;
  /** Extra classes for the trigger button (style override). */
  buttonClassName?: string;
}

export function LanguageSwitcher({
  align = "right",
  className,
  buttonClassName,
}: Props) {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const hydrate = useLangStore((s) => s.hydrate);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Read the persisted language on mount (default render is always "lo" to
  // match the server-rendered markup, avoiding a hydration mismatch).
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSelect = (code: LangCode) => {
    setLang(code);
    setOpen(false);
  };

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border bg-background/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:bg-muted hover:text-foreground",
          buttonClassName,
        )}
        aria-label="Change language"
        aria-expanded={open}
      >
        <Globe size={14} />
        {current.label}
        <ChevronDown
          size={13}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 w-28 overflow-hidden rounded-lg border bg-background shadow-md",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => handleSelect(l.code)}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-muted",
                l.code === lang
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {l.label}
              {l.code === lang && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
