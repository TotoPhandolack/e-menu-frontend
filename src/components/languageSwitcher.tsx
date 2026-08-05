"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Read the persisted language on mount (default render is always "lo" to
  // match the server-rendered markup, avoiding a hydration mismatch).
  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        wrapRef.current &&
        !wrapRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    // The trigger lives inside a scroll-collapsed header; once the menu is
    // open, any scroll/resize can move the trigger out from under it, so
    // just close it rather than let it drift or stay clipped.
    const handleDismiss = () => setOpen(false);
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleDismiss, true);
    window.addEventListener("resize", handleDismiss);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleDismiss, true);
      window.removeEventListener("resize", handleDismiss);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos(
        align === "right"
          ? { top: rect.bottom + 6, right: window.innerWidth - rect.right }
          : { top: rect.bottom + 6, left: rect.left },
      );
    }
    setOpen((v) => !v);
  };

  const handleSelect = (code: LangCode) => {
    setLang(code);
    setOpen(false);
  };

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
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

      {open &&
        menuPos &&
        mounted &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] w-28 overflow-hidden rounded-lg border bg-background shadow-md"
            style={{ top: menuPos.top, left: menuPos.left, right: menuPos.right }}
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
          </div>,
          document.body,
        )}
    </div>
  );
}
