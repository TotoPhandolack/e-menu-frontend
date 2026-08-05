@AGENTS.md

## Design Context

See [PRODUCT.md](PRODUCT.md) for brand strategy (register: `product`, users: cashier staff + table-side diners in Laos, personality: Efficient · Clean · Trustworthy) and [DESIGN.md](DESIGN.md) for the visual system (Creative North Star: "The Well-Run Kitchen" — White Canvas palette on a 60/30/10 split, OKLCH tokens, Lao-first typography with Phetsarath OT + Noto Sans Lao, flat tonal elevation, tenant-injected `--primary`).

**Four colour rules that are easy to get wrong here:**
1. `--primary` (`#FEDB71` gold) is **fill-only** — 1.35:1 on white. For brand-tinted *text* use `--primary-strong`; for brand-tinted *strokes* use `--ring`. Never `text-primary`.
2. Text on gold is always `--primary-foreground` (ink). White on gold is 1.35:1.
3. `--background` and `--card` are **both `#FFFFFF`** (1.0:1). A card is defined *only* by its border or ring — never remove one. For a genuinely recessed region use `--muted`.
4. **Light mode only.** No `dark:` variants, no `.dark` block, no theme toggle.
