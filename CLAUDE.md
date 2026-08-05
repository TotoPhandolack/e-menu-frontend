@AGENTS.md

## Design Context

This project uses Impeccable for UI design. See [PRODUCT.md](PRODUCT.md) for brand strategy (register: `product`, users: cashier staff + table-side diners in Laos, personality: Efficient · Clean · Trustworthy) and [DESIGN.md](DESIGN.md) for the visual system (Creative North Star: "The Well-Run Kitchen" — Warm Canvas palette on a 60/30/10 split, OKLCH tokens, Lao-first typography with Phetsarath OT + Noto Sans Lao, flat tonal elevation, tenant-injected `--primary`).

**Three colour rules that are easy to get wrong here:**
1. `--primary` (`#FEDB71` gold) is **fill-only** — 1.29:1 on the canvas. For brand-tinted *text* use `--primary-strong`; for brand-tinted *strokes* use `--ring`. Never `text-primary`.
2. Text on gold is always `--primary-foreground` (ink). White on gold is 1.35:1.
3. **Light mode only.** No `dark:` variants, no `.dark` block, no theme toggle.
