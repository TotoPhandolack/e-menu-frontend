# Product

## Register

product

## Users

**Cashiers / restaurant staff** — operating at a busy counter or floor in Laos. They need to read order status at a glance, manage tables, and run the full POS workflow without friction. Their environment is loud, fast, and often touch-only on a tablet.

**Diners at the table** — scanning a QR code on their phone, reading in Lao script (primary) or Thai/English. Their task is browse → pick → order in as few steps as possible. They are not exploring an app; they are trying to eat.

## Product Purpose

A multi-tenant restaurant e-menu platform. Restaurants sign up, configure their menu and tables, and generate QR codes that customers scan. The product removes the paper menu and the need to flag down a waiter to order. Success looks like: diner places order in under 60 seconds, cashier handles a full-table shift without confusion.

## Brand Personality

Efficient · Clean · Trustworthy

The product is a tool, not an experience. It should feel confident and calm — like a well-run kitchen, not a food-delivery consumer app. Staff should trust it in a rush; diners should feel no friction.

## Anti-references

- **UberEats / Foodpanda / GrabFood** — loud, consumer-marketing energy, heavy promotions, gamified UI. This product is not a marketplace; it is a table-side tool.
- **Generic white-label SaaS that could be anything** — forgettable, identity-free. The Lao market and restaurant context should be legible in the UI.
- **Glassmorphism restaurant apps** — blurred hero images behind menus, over-styled card treatments. Decoration that competes with the food.

## Design Principles

1. **Task first, decoration last.** Every UI element earns its place by aiding the task. If it doesn't help the cashier read order state or the diner find a dish, it shouldn't be there.
2. **Lao-first legibility.** The primary audience reads Lao script. Typography choices, line height, and hierarchy must serve multilingual text — Lao + Latin characters together, not as an afterthought.
3. **Operational clarity at a glance.** A cashier in a busy restaurant cannot afford to decode ambiguous status indicators. Order state, table status, and action affordances must be immediately scannable.
4. **Localized trust.** The product should feel built for this context — not a Western POS translated into Lao. Micro-decisions (copy tone, spacing, interaction patterns) should suit the local market.
5. **Theme-agnostic base, restaurant-owned accent.** Restaurants inject their brand color via `--primary`. The neutral system must carry any of the nine theme presets without fighting them.

## Accessibility & Inclusion

WCAG AA baseline. Lao script requires careful font selection — Noto Sans Lao and Phetsarath are already in the stack. Reduced motion support required for all animations (already partially implemented). No specific stated needs beyond the above.
