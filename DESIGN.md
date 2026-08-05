---
name: Emenu
description: Lao-first restaurant e-menu and POS — scan to order, clarity to operate.
colors:
  chalk-white: "oklch(1 0 0)"
  gold-accent: "oklch(0.9001 0.131 91.36)"
  gold-strong: "oklch(0.52 0.115 75)"
  gold-ring: "oklch(0.655 0.13 91.36)"
  deep-ink: "oklch(0.1835 0.0327 297.47)"
  ghost-surface: "oklch(0.956 0.0115 84.58)"
  slate-gray: "oklch(0.5146 0.0233 307.96)"
  hairline: "oklch(0.9239 0.0149 80.71)"
  field-stroke: "oklch(0.66 0.02 80)"
  kitchen-red: "oklch(0.546 0.1826 32.13)"
typography:
  display:
    fontFamily: "Outfit, Phetsarath OT, Noto Sans Lao, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Outfit, Phetsarath OT, Noto Sans Lao, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Outfit, Phetsarath OT, Noto Sans Lao, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Outfit, Noto Sans Lao, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Outfit, Noto Sans Lao, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.01em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.gold-accent}"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.gold-accent}"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-destructive:
    backgroundColor: "{colors.kitchen-red}"
    textColor: "{colors.chalk-white}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  card:
    backgroundColor: "{colors.chalk-white}"
    rounded: "{rounded.xl}"
    padding: "16px 0"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
---

# Design System: Emenu

## 1. Overview

**Creative North Star: "The Well-Run Kitchen"**

A well-run kitchen doesn't waste motion. Every tool is where it belongs, every surface is clear, every action has a single obvious next step. Emenu carries that discipline into the digital — a product UI where operational clarity is the design. The White Canvas palette is near-monochrome by intent: a white ground, warm-tinted greys for tone, and exactly one chromatic note. That note is Gold Accent, and it appears only where a hand should go. A cashier reads order state at a glance because nothing else on the screen is competing for the eye; a diner finds their dish without scanning through marketing. The brand color lives in `--primary`, injected per restaurant, so each tenant gets identity without the neutral system losing coherence.

Lao script is not an afterthought. Phetsarath OT handles headlines with the weight and legibility the script demands at display sizes; Noto Sans Lao covers body copy across the full Unicode range; Outfit carries Latin characters at the same visual mass. The font stack degrades gracefully in that order, so Lao characters always render through a Lao-optimized face.

This system explicitly rejects the energy of delivery-app marketplaces (UberEats, Foodpanda, GrabFood) — heavy promotions, gamified UI, dense visual layering designed to maximize dwell time. This product wants to minimize dwell time: get the diner to their order, get the cashier to their next table. Glassmorphism and blurred hero images behind menus are equally banned — decoration that competes with the food.

**Key Characteristics:**
- White foundation with warm near-neutral greys — 60% white ground / 30% structure and tonal fills / 10% gold, the accent reserved strictly for action
- Flat tonal elevation — no drop shadows; background and card are the same white (1.0:1), so ring-borders are not decoration, they are the only thing separating surfaces
- Light mode only — one set of contrast guarantees, no `dark:` variants anywhere in the codebase
- Lao-first typography — Phetsarath OT and Noto Sans Lao as primary weight-carriers, never fallbacks
- Tenant-injected accent — the system recedes; the restaurant brand advances
- Dense but breathable layout — cashier UI needs scannable information density; diner UI needs uncluttered whitespace

## 2. Colors: The White Canvas Palette

Built on a 60 / 30 / 10 split. **60%** Chalk White is the ground — page *and* cards, the same value. **30%** is structure: hairlines, Ghost Surface fills, and muted type, all carrying a faint warm cast (hue ~68–85 at very low chroma) so the white never reads clinical. **10%** Gold Accent marks what you can act on, and nothing else.

Because the page and its cards are the same white, this palette has no tonal separation to fall back on. Structure comes from strokes and from Ghost Surface — see The Card-Needs-An-Edge Rule.

### Accent — the 10%
- **Gold Accent** (`oklch(0.9001 0.131 91.36)`, `#FEDB71`): Default `--primary`. Primary buttons, the cart FAB, active category pills, active nav. **Fill only.**
- **Gold Strong** (`oklch(0.52 0.115 75)`, `#8F5D00`): `--primary-strong`. The *only* legible way to write brand-tinted text on a light surface — 5.62:1 on Chalk White, 4.94:1 on Ghost Surface. Prices, inline links, emphasis.
- **Gold Ring** (`oklch(0.655 0.13 91.36)`, `#AE8D12`): `--ring`. Focus rings and selected-state strokes. Clears the 3:1 non-text floor (3.18:1 on white) where the raw accent cannot.

### Neutral
- **Chalk White** (`oklch(1 0 0)`, `#FFFFFF`): `--background`, `--card`, `--popover`, `--sidebar`. The page and everything on it. The 60%.
- **True Black** (`oklch(0 0 0)`, `#000000`): `--secondary`, with Chalk White as `--secondary-foreground` (21:1). Small emphatic chips and buttons only — it is not a surface colour and must never take a panel.
- **Deep Ink** (`oklch(0.1835 0.0327 297.47)`, `#140F1F`): Body text and icon fills. 18.8:1 on white. Also the foreground *on* Gold Accent (13.9:1).
- **Ghost Surface** (`oklch(0.956 0.0115 84.58)`, `#F4F0E8`): `--muted`. The only tonal layer in the system — chips, card footers, hover states, and any panel that must read as recessed. Carries the 30% alongside the hairlines.
- **Slate Gray** (`oklch(0.5146 0.0233 307.96)`, `#6B6472`): Muted foreground. 5.69:1 on white, 5.00:1 on Ghost Surface. Do not go lighter for body text.
- **Hairline** (`oklch(0.9239 0.0149 80.71)`, `#EBE5DB`): Dividers and card boundaries.
- **Field Stroke** (`oklch(0.66 0.02 80)`, `#9B9487`): `--input`. Form-control borders only, held at 3:1 per WCAG 1.4.11.

### Destructive
- **Kitchen Red** (`oklch(0.546 0.1826 32.13)`, `#C4361E`): Error states, destructive actions. 5.39:1 on white. One on screen means danger; more than two means alarm.

### Named Rules
**The Fill-Only Rule.** Gold Accent is 1.35:1 on Chalk White. It can never be text, an icon, a hairline, or a focus ring. If you need gold that *reads*, reach for Gold Strong (text) or Gold Ring (strokes). White on Gold Accent is 1.35:1 and is never correct — the foreground on gold is always Deep Ink.

**The Card-Needs-An-Edge Rule.** `--background` and `--card` are the *same* white — 1.0:1. There is no fill difference to separate a card from the page, so the hairline ring is not styling, it is the entire boundary. A card with no ring or border does not exist on screen. When a region needs to read as genuinely recessed rather than merely bounded, use Ghost Surface.

**The Slate Gray Floor Rule.** `oklch(0.5146 0.0233 307.96)` is the lightest permitted body text on either ground. When in doubt, shift toward Deep Ink.

**The Tenant Accent Rule.** `--primary` is a reservation, not a committed color; `THEME_PRESETS` in `src/lib/theme.ts` swaps it per restaurant. Any preset must ship `primaryStrong` alongside `primary` — a light accent has no readable text form otherwise. Never assume the accent is dark enough to write with.

## 3. Typography

**Display / Headline Font:** Outfit (weights 400–700; Latin, numerals)
**Lao Headline Font:** Phetsarath OT (display-weight Lao letterforms; use at ≥1rem)
**Lao Body Font:** Noto Sans Lao (full Lao Unicode, 100–900 axis; use below 1rem)
**Mono Font:** Roboto Mono (order IDs, table numbers, timestamps)
**Decorative:** Caveat (handwritten; reserved for restaurant-injected brand accents, never system UI)

**Character:** Outfit is a clean geometric sans with enough optical weight to pair well with Lao script's naturally bold strokes. The full stack (Outfit → Phetsarath OT → Noto Sans Lao) means Lao characters always render through a Lao-optimized face — never falling back to a generic sans that clips descenders.

### Hierarchy
- **Display** (700, `clamp(2rem, 5vw, 3.5rem)`, line-height 1.1, letter-spacing −0.02em): Restaurant name at top of menu, onboarding heroes. Phetsarath OT carries Lao equivalents at this size.
- **Headline** (600, `1.5rem / 24px`, line-height 1.3): Menu category headers, dashboard section titles.
- **Title** (500, `1rem / 16px`, line-height 1.4): Card titles, modal headings, list item primary text.
- **Body** (400, `0.875rem / 14px`, line-height 1.6, max 65ch): Menu item descriptions, order details, all flowing text. Line height 1.6 is required for Lao script legibility.
- **Label** (500, `0.75rem / 12px`, letter-spacing 0.01em): Status indicators, table numbers, small metadata. Not uppercase-tracked — that pattern is banned.

### Named Rules
**The Lao Line Height Rule.** Lao script has tall ascending and descending letterforms that clip at standard sans line heights. Body text requires `line-height: 1.6` minimum. Never go below 1.5 for any Lao copy.

**The Phetsarath Ceiling.** Use Phetsarath OT only at headline and display sizes (≥1rem). Below that, Noto Sans Lao has superior hinting. Swap at the 1rem boundary.

## 4. Elevation

This system is flat by default. Surfaces are separated by tonal layering and hairline ring-borders — not drop shadows. The card treatment uses `box-shadow: 0 0 0 1px oklch(0.1835 0.0327 297.47 / 0.1)` — a 1px inset ring at 10% foreground opacity. Visible enough to delimit the card; invisible enough to disappear into the design.

Light mode is the only mode. There is no dark theme, no `.dark` block, and no `dark:` variant in this codebase — see The One Mode Rule below.

The system has one white level and one recessed level:
- **Layer 0 (background / card / popover / sheet):** Chalk White `#FFFFFF` — the page and everything on it, undifferentiated by fill
- **Layer −1 (recessed):** Ghost Surface `#F4F0E8` — the only way to push a region visually *behind* the page

### Named Rules
**The Flat Register Rule.** No `box-shadow` with blur > 0 on any component at rest. Interactive elements may add a soft ambient shadow on hover (`0 2px 8px oklch(0.1835 0.0327 297.47 / 0.08)`) to signal interactivity — but only interactive elements, never static containers.

**The Soft-Selection Rule** (the one exception to Flat Register). A *selected* element may carry a resting accent glow — `.glow-selected` in `globals.css`. Use it instead of a hard `--ring` stroke: `--ring` is a dark mustard sized for the 3:1 focus floor, and as a resting border it reads muddy against the clean gold. The glow is three layers — a 1px accent edge to hold the shape, a 4px halo to soften it, and a diffuse warm lift.

Because the glow is deliberately below 3:1, **it may never be the only signal of selection.** Every component using it also carries the state in a check badge, a fill, or `aria-pressed`. If you add it somewhere with no second signal, you have made an inaccessible control. `.glow-hover` is the lighter companion for hover hints. Both read from `--primary`, so they re-tint automatically per tenant theme.

**The Ring-Not-Border Rule.** Card boundaries are drawn with `box-shadow: 0 0 0 1px oklch(0.1835 0.0327 297.47 / 0.1)`, not `border`. This is the system's one-pixel line vocabulary. With 1.0:1 between the page and its cards, this ring is doing *all* the work of separating them — it is structural here, not decorative.

**The One Mode Rule.** This product is light-mode only. Do not add `dark:` variants, a `.dark` block, `prefers-color-scheme` queries, or a theme toggle. A cashier's screen and a diner's phone both operate under restaurant lighting; a second mode doubles the surface area of every contrast guarantee above for no operational gain.

## 5. Components

### Buttons
Precise and efficient — tight padding, clean edges, no decorative weight. Every state is unambiguous; active sinks 1px for tactile confirmation.

- **Shape:** Gently rounded (10px / `--radius-lg`)
- **Primary:** Gold Accent fill, **Deep Ink text**; 32px height, 10px horizontal padding
- **Hover:** fill drops to `--primary/90` — no transform, no lift
- **Focus:** 3px ring at `--ring/50`, 1px border in Gold Ring
- **Active:** `translateY(1px)` — confirms the action physically
- **Secondary:** True Black fill, Chalk White text; stays dark on hover (`--secondary/85`)
- **Outline:** Chalk White fill, Hairline border, Deep Ink text; Ghost Surface on hover
- **Ghost:** No fill, no border; Ghost Surface on hover
- **Link:** Gold Strong text, underline on hover — never Gold Accent
- **Destructive:** Kitchen Red fill, Chalk White text
- **Disabled:** 50% opacity, pointer-events none

### Cards
The primary content container. Strict separation between header, body, and footer zones. Footer is always Ghost Surface tinted with a top border — distinct from content without adding visual weight.

- **Corner Style:** Gently rounded (14px / `--radius-xl`)
- **Background:** Chalk White in light mode; Layer 1 (`oklch(0.205 0 0)`) in dark
- **Shadow Strategy:** Ring-only per Elevation rules
- **Internal Padding:** 16px horizontal; footer separated with border-top and muted background
- **Title:** Outfit/Phetsarath 500 at 1rem; Description in Slate Gray at 0.875rem

### Inputs / Fields
Minimally styled — the input presents itself through stroke and height. Forms in this UI are transactional, not explorative.

- **Style:** Transparent fill, Hairline border, 10px radius, 32px height
- **Placeholder:** Slate Gray (`oklch(0.556 0 0)`) — meets 4.5:1 minimum
- **Focus:** Border shifts to Focus Ash; 3px ring at 50% opacity
- **Error (`aria-invalid`):** Border and ring shift to Kitchen Red
- **Disabled:** Ghost Surface fill at 50%; 50% overall opacity

### Navigation (Sidebar)
Ghost Surface panel — recessed against the white page, which is what distinguishes it. Active items use the tenant primary fill — never a side-stripe.

- **Style:** Ghost Surface background, 1px Hairline right border
- **Item default:** Transparent fill, Deep Ink text
- **Item hover:** Ghost Surface tint
- **Item active:** `--primary` fill, `--primary-foreground` text — the restaurant's injected color marks location
- **Item text:** Outfit 500 at 0.875rem

### Order Status Badge (Signature Component)
The most operationally critical component. A cashier reads dozens per shift; the badge must be scannable at arm's length. Four states are differentiated by background color, not by shade alone.

Exposed as `--status-*` token pairs; use `bg-status-preparing text-status-preparing-foreground`, never raw palette colors.

- **Pending:** `oklch(0.948 0.004 80)` (warm neutral), `oklch(0.515 0.015 300)` text — 4.82:1
- **Confirmed:** `oklch(0.942 0.03 248)` (soft blue), `oklch(0.396 0.09 250)` text — 7.87:1
- **Preparing:** `oklch(0.915 0.075 58)` (orange), `oklch(0.46 0.125 45)` text — 5.57:1
- **Complete:** `oklch(0.938 0.04 150)` (green), `oklch(0.439 0.095 153)` text — 6.31:1
- **Shape:** Pill (18px radius / `--radius-2xl`)
- **Typography:** Outfit 500 at 0.75rem, 4px 8px padding

**The Badge-Is-Not-The-Accent Rule.** Preparing sits at hue 58 — held 33° clear of the Gold Accent at hue 91.4, and at a little over half its chroma. This gap is deliberate: gold means *tap this*, amber means *this order is cooking*. If a status tint drifts toward the accent, the cashier loses the one color that marks an action.

## 6. Do's and Don'ts

### Do:
- **Do** use `box-shadow: 0 0 0 1px oklch(0.1835 0.0327 297.47 / 0.1)` as the card boundary. Not `border`.
- **Do** keep muted foreground at ≥ `oklch(0.5146 0.0233 307.96)` for any body text. Lighter fails 4.5:1.
- **Do** hold the 60/30/10 split: Chalk White grounds everything, hairlines and Ghost Surface carry the structure, Gold Accent marks only what is actionable.
- **Do** use `--primary` as a fill with `--primary-foreground` on it, `--primary-strong` for brand-tinted text, and `--ring` for brand-tinted strokes. Three tokens, three jobs.
- **Do** set Lao script body text at `line-height: 1.6` minimum. Lower clips ascending letterforms.
- **Do** design every affordance to work with any `--primary` value — deep red, lime, navy, or gold.
- **Do** use Phetsarath OT for Lao at ≥1rem; Noto Sans Lao below that boundary.
- **Do** reserve Kitchen Red for destructive and error states only. Its rarity is its signal.
- **Do** differentiate order status badges by background color, not shade. Cashier legibility requires four visually distinct states.

### Don't:
- **Don't** remove a card's border or ring "to clean it up". With a white-on-white system that deletes the card.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent on cards, list items, or callouts. Rewrite with full borders, background tints, or nothing.
- **Don't** use delivery-app UI patterns: promotional banners, gamified badges, carousel-first layouts, discount overlays. This is a table-side tool, not a marketplace.
- **Don't** use generic white-label SaaS scaffolding — forgettable structure that could belong to any product. The Lao market context must be legible in the design decisions.
- **Don't** use glassmorphism: blurred hero images behind menus, frosted-glass card treatments. Decoration that competes with the food is prohibited.
- **Don't** use gradient text (`background-clip: text` with a gradient). Solid color, always. Weight or size for emphasis.
- **Don't** write text, draw an icon, or stroke a border in `--primary`. It is 1.35:1 on white. This is the single easiest way to break the system.
- **Don't** put white text on Gold Accent — 1.35:1. The foreground on gold is always Deep Ink.
- **Don't** push the neutrals past ~0.025 chroma. The warmth is a whisper (hue 68–85, chroma 0.003–0.02); at higher chroma the greys turn cream and start competing with the food photography.
- **Don't** add a dark mode, a `dark:` variant, or a theme toggle. See The One Mode Rule.
- **Don't** use tracked uppercase eyebrow labels on every section, or numbered section markers (`01 · 02 · 03`). This is product UI, not editorial scaffolding.
- **Don't** use arbitrary `z-index` values (999, 9999). Use semantic scale: dropdown (10), sticky (20), modal-backdrop (30), modal (40), toast (50), tooltip (60).
