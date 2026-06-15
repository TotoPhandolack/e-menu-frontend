---
name: Emenu
description: Lao-first restaurant e-menu and POS — scan to order, clarity to operate.
colors:
  chalk-white: "oklch(1 0 0)"
  blackboard: "oklch(0.205 0 0)"
  deep-ink: "oklch(0.145 0 0)"
  ghost-surface: "oklch(0.97 0 0)"
  slate-gray: "oklch(0.556 0 0)"
  hairline: "oklch(0.922 0 0)"
  focus-ash: "oklch(0.708 0 0)"
  kitchen-red: "oklch(0.577 0.245 27.325)"
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
    backgroundColor: "{colors.blackboard}"
    textColor: "{colors.chalk-white}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.deep-ink}"
    textColor: "{colors.chalk-white}"
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

A well-run kitchen doesn't waste motion. Every tool is where it belongs, every surface is clear, every action has a single obvious next step. Emenu carries that discipline into the digital — a product UI where operational clarity is the design. The Blackboard-and-Chalk palette is monochromatic by intent: zero visual noise means a cashier can read order state at a glance and a diner can find their dish without scanning through marketing. The brand color lives in `--primary`, injected per restaurant, so each tenant gets identity without the neutral system losing coherence.

Lao script is not an afterthought. Phetsarath OT handles headlines with the weight and legibility the script demands at display sizes; Noto Sans Lao covers body copy across the full Unicode range; Outfit carries Latin characters at the same visual mass. The font stack degrades gracefully in that order, so Lao characters always render through a Lao-optimized face.

This system explicitly rejects the energy of delivery-app marketplaces (UberEats, Foodpanda, GrabFood) — heavy promotions, gamified UI, dense visual layering designed to maximize dwell time. This product wants to minimize dwell time: get the diner to their order, get the cashier to their next table. Glassmorphism and blurred hero images behind menus are equally banned — decoration that competes with the food.

**Key Characteristics:**
- Achromatic zinc foundation — zero brand-color interference at the base layer; restaurants project identity through `--primary`
- Flat tonal elevation — no drop shadows; ring-borders and surface layering carry all depth
- Lao-first typography — Phetsarath OT and Noto Sans Lao as primary weight-carriers, never fallbacks
- Tenant-injected accent — the system recedes; the restaurant brand advances
- Dense but breathable layout — cashier UI needs scannable information density; diner UI needs uncluttered whitespace

## 2. Colors: The Blackboard Palette

A deliberate monochrome. Restaurants project their own color into `--primary`; the neutral system must not compete with any injected brand color. Every design decision at the base layer must work correctly when `--primary` becomes deep red, lime green, navy, or gold.

### Primary (tenant-injected)
- **Blackboard** (`oklch(0.205 0 0)`, `#2e2e2e`): Default `--primary` before a restaurant injects their brand color. Used for primary buttons, active navigation states, and key affordances. In every deployed restaurant, this value is replaced with the brand hue.

### Neutral
- **Chalk White** (`oklch(1 0 0)`, `#ffffff`): The background canvas. Pure white, not tinted — warmth comes from the restaurant's injected `--primary`; the base layer stays clean.
- **Deep Ink** (`oklch(0.145 0 0)`, `#1e1e1e`): Body text, icon fills, high-contrast foreground. Clears 4.5:1 on Chalk White with room to spare.
- **Ghost Surface** (`oklch(0.97 0 0)`, `#f5f5f5`): Secondary and muted surfaces — sidebar backgrounds, chip fills, card footers, hover states. Barely-there; never cream-tinted.
- **Slate Gray** (`oklch(0.556 0 0)`, `#767676`): Muted foreground — secondary labels, descriptions, placeholders. Meets 4.5:1 on Chalk White at this exact value. Do not go lighter for any body text.
- **Hairline** (`oklch(0.922 0 0)`, `#e8e8e8`): Border strokes and input outlines. The visual boundary between elements.
- **Focus Ash** (`oklch(0.708 0 0)`, `#b2b2b2`): Focus rings and interactive state outlines — appears as a 3px ring at 50% opacity.

### Destructive
- **Kitchen Red** (`oklch(0.577 0.245 27.325)`, `~#e04828`): Error states, destructive actions, alert badges. The one chromatic color in the base system. One Kitchen Red on screen means danger; more than two means alarm.

### Named Rules
**The Slate Gray Floor Rule.** `oklch(0.556 0 0)` is the minimum lightness for any body text on Chalk White. Anything lighter fails 4.5:1 contrast. When in doubt, shift toward Deep Ink.

**The Tenant Accent Rule.** `--primary` is a reservation, not a committed color. Every build decision about primary buttons, active states, and key affordances must survive replacement with any restaurant brand hue. Never assume Blackboard is the final primary.

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

This system is flat by default. Surfaces are separated by tonal layering and hairline ring-borders — not drop shadows. The card treatment uses `box-shadow: 0 0 0 1px oklch(0.145 0 0 / 0.1)` — a 1px inset ring at 10% foreground opacity. Visible enough to delimit the card; invisible enough to disappear into the design.

Dark mode uses three distinct surface tones instead of shadows:
- **Layer 0 (background):** `oklch(0.145 0 0)` — the base canvas
- **Layer 1 (card):** `oklch(0.205 0 0)` — one step lighter
- **Layer 2 (raised):** `oklch(0.269 0 0)` — popovers, dropdowns, modals

### Named Rules
**The Flat Register Rule.** No `box-shadow` with blur > 0 on any component at rest. Interactive elements may add a soft ambient shadow on hover (`0 2px 8px oklch(0 0 0 / 0.08)`) to signal interactivity — but only interactive elements, never static containers.

**The Ring-Not-Border Rule.** Card boundaries are drawn with `box-shadow: 0 0 0 1px oklch(0.145 0 0 / 0.1)`, not `border`. This is the system's one-pixel line vocabulary. Using `border` on cards produces a slightly different visual weight due to box-sizing quirks; the ring is the correct primitive.

## 5. Components

### Buttons
Precise and efficient — tight padding, clean edges, no decorative weight. Every state is unambiguous; active sinks 1px for tactile confirmation.

- **Shape:** Gently rounded (10px / `--radius-lg`)
- **Primary:** Blackboard fill, Chalk White text; 32px height, 10px horizontal padding; darkens to Deep Ink on hover
- **Hover:** `oklch(0.145 0 0)` fill deepens — no transform, no lift
- **Focus:** 3px ring at `oklch(0.708 0 0 / 0.5)`, 1px border in Focus Ash
- **Active:** `translateY(1px)` — confirms the action physically
- **Secondary:** Ghost Surface fill, Blackboard text
- **Outline:** Chalk White fill, Hairline border, Blackboard text; Ghost Surface on hover
- **Ghost:** No fill, no border; Ghost Surface on hover
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
Ghost Surface panel — lighter than the main canvas in dark mode, matching secondary in light. Active items use the tenant primary fill — never a side-stripe.

- **Style:** Ghost Surface background, 1px Hairline right border
- **Item default:** Transparent fill, Deep Ink text
- **Item hover:** Ghost Surface tint
- **Item active:** `--primary` fill, `--primary-foreground` text — the restaurant's injected color marks location
- **Item text:** Outfit 500 at 0.875rem

### Order Status Badge (Signature Component)
The most operationally critical component. A cashier reads dozens per shift; the badge must be scannable at arm's length. Four states are differentiated by background color, not by shade alone.

- **Pending:** Ghost Surface background, Slate Gray text
- **Confirmed:** `oklch(0.95 0.05 230)` (soft blue tint), `oklch(0.25 0.08 230)` text
- **Preparing:** `oklch(0.95 0.12 80)` (amber tint), `oklch(0.4 0.12 80)` text
- **Complete:** `oklch(0.95 0.05 145)` (green tint), `oklch(0.35 0.1 145)` text
- **Shape:** Pill (18px radius / `--radius-2xl`)
- **Typography:** Outfit 500 at 0.75rem, 4px 8px padding

## 6. Do's and Don'ts

### Do:
- **Do** use `box-shadow: 0 0 0 1px oklch(0.145 0 0 / 0.1)` as the card boundary. Not `border`.
- **Do** keep muted foreground at ≥ `oklch(0.556 0 0)` for any body text on Chalk White. Lighter fails 4.5:1.
- **Do** set Lao script body text at `line-height: 1.6` minimum. Lower clips ascending letterforms.
- **Do** design every affordance to work with any `--primary` value — deep red, lime, navy, or gold.
- **Do** use Phetsarath OT for Lao at ≥1rem; Noto Sans Lao below that boundary.
- **Do** reserve Kitchen Red for destructive and error states only. Its rarity is its signal.
- **Do** differentiate order status badges by background color, not shade. Cashier legibility requires four visually distinct states.

### Don't:
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent on cards, list items, or callouts. Rewrite with full borders, background tints, or nothing.
- **Don't** use delivery-app UI patterns: promotional banners, gamified badges, carousel-first layouts, discount overlays. This is a table-side tool, not a marketplace.
- **Don't** use generic white-label SaaS scaffolding — forgettable structure that could belong to any product. The Lao market context must be legible in the design decisions.
- **Don't** use glassmorphism: blurred hero images behind menus, frosted-glass card treatments. Decoration that competes with the food is prohibited.
- **Don't** use gradient text (`background-clip: text` with a gradient). Solid color, always. Weight or size for emphasis.
- **Don't** tint the neutral base warm or cool by default. The achromatic foundation is intentional — warmth comes from `--primary`, not from background tinting.
- **Don't** use tracked uppercase eyebrow labels on every section, or numbered section markers (`01 · 02 · 03`). This is product UI, not editorial scaffolding.
- **Don't** use arbitrary `z-index` values (999, 9999). Use semantic scale: dropdown (10), sticky (20), modal-backdrop (30), modal (40), toast (50), tooltip (60).
