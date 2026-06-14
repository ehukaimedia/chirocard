---
name: ChiroCard
description: Calm, trustworthy, clinical-grade visual system for a local-first bodywork passport.
colors:
  primary: "#059669"
  active-emerald: "#10b981"
  glow-emerald: "#34d399"
  mint-paper: "#ecfdf5"
  deep-pine: "#064e3b"
  ink: "#18181b"
  muted-slate: "#71717a"
  hairline: "#e4e4e7"
  alert-red: "#ef4444"
  frosted-glass: "#ffffff99"
  glass-border: "#ffffff66"
typography:
  display:
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  pill: "9999px"
  modal: "24px"
  card: "16px"
  input: "12px"
  tile: "8px"
spacing:
  card: "16px"
  field: "8px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.active-emerald}"
    textColor: "#ffffff"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  card-glass:
    backgroundColor: "{colors.frosted-glass}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    height: "44px"
    padding: "0 12px"
---

# Design System: ChiroCard

## 1. Overview

**Creative North Star: "The Calm Record"**

ChiroCard should feel like a well-kept personal health record that happens to be
beautiful — quiet, legible, and unmistakably *yours*. The system is built on a
single calm color story (emerald on a soft mint paper) and a frosted-glass
surface language that keeps the interface feeling light and unintimidating. Depth
comes from translucency and soft diffusion, not heavy chrome. The personality is
**calm, trustworthy, clinical-grade**: the confidence of a medical record without
the coldness of one.

It explicitly rejects the **cold, dense clinical EHR** (Epic / MyChart): no
cramped gray data tables, no jargon, no dropdown mazes, no institutional dread.
Where an EHR overwhelms, ChiroCard reassures. At the same time — per the product
principle *"calm over clever"* — the frosted glass and emerald glow are seasoning,
not the meal: they must never tip the interface into hype or decoration for its
own sake. When in doubt, quieter.

**Key Characteristics:**
- One calm color story: emerald accents on emerald-tinted "mint paper".
- Frosted-glass surfaces (translucent white, soft blur) instead of hard cards.
- Pill-shaped, soft, tactile controls; generous radii throughout.
- Soft, diffuse depth (ambient shadow + subtle glow), never hard drop shadows.
- Inter everywhere — one humanist sans, sized for easy reading by older users.

## 2. Colors

A single-hue emerald palette over a tinted-neutral surface, with zinc neutrals for text and a lone red reserved for genuine alerts.

### Primary
- **Trust Emerald** (#059669): The primary action and brand color — primary buttons, active nav, key affordances, "today" markers. Carries the brand's quiet authority.
- **Active Emerald** (#10b981): The brighter, engaged state — primary hover, selected calendar day, secondary actions, the `::selection` highlight.

### Tertiary
- **Glow Emerald** (#34d399): Accent and luminance only — the soft glow animation, highlight gradients, focus shimmer. Never a fill for large areas.

### Neutral
- **Mint Paper** (#ecfdf5, emerald-50): The page surface. The whole app rests on this softly emerald-tinted background, not stark white — it's what makes the product feel calm rather than clinical.
- **Frosted Glass** (#ffffff99, rgba(255,255,255,0.6)): The default card/surface fill — translucent white over Mint Paper, with backdrop blur. **Glass Border** (#ffffff66) edges it.
- **Deep Pine** (#064e3b, emerald-900): Emerald-toned text used on glass/highlight surfaces.
- **Ink** (#18181b, zinc-900): Primary body and heading text on light surfaces.
- **Muted Slate** (#71717a, zinc-500): Secondary text, labels, placeholders, weekday headers.
- **Hairline** (#e4e4e7, zinc-200): Borders, dividers, input strokes.

### Functional
- **Alert Red** (#ef4444, red-500): Destructive actions, errors, required-field markers. The *only* non-emerald hue; its rarity is what makes it read as urgent.

### Named Rules
**The One Hue Rule.** Emerald is the only brand color. Do not introduce blue, purple, or multi-color accent systems — the single calm hue is the trust signal. Red appears only for destructive or error states, never decoratively.

## 3. Typography

**Display / Body / Label Font:** Inter (with `system-ui, Avenir, Helvetica, Arial, sans-serif` fallback)

**Character:** One humanist sans across the entire product. Inter is legible, neutral, and trustworthy — chosen for clarity over personality, sized generously because many users are older or in discomfort. There is no decorative display face; hierarchy comes from weight and size, not font contrast.

### Hierarchy
- **Display** (700, 1.875rem / `text-3xl`, line-height ~1.15, -0.01em): Page titles (e.g. "Privacy Policy", screen headers).
- **Title** (700, 1.25rem / `text-xl`, line-height ~1.3): Card and modal headings, section titles.
- **Body** (400, 0.875rem / `text-sm`, line-height 1.5): Default reading text and most UI copy.
- **Label** (500, 0.75rem / `text-xs`, +0.02em, often uppercase): Field labels, metadata, weekday headers, captions.

### Named Rules
**The Readable-First Rule.** Body text never drops below 0.875rem (14px); core records stay comfortably readable for older users. Weight (400 → 500 → 700), not color or font-swaps, carries hierarchy.

## 4. Elevation

ChiroCard conveys depth through **frosted translucency and soft ambient diffusion**, not hard drop shadows. Surfaces are panes of blurred glass floating over the Mint Paper; the sense of layering comes from `backdrop-blur` and low-opacity ambient shadow. A subtle emerald glow is reserved for live/active emphasis only.

### Shadow Vocabulary
- **Ambient glass** (`box-shadow: 0 4px 30px rgba(0,0,0,0.1)`): The default card lift — broad, soft, barely-there.
- **Ambient subtle** (`box-shadow: 0 2px 10px rgba(0,0,0,0.05)`): Lighter surfaces and small chips.
- **Action lift** (`box-shadow: 0 10px 15px -3px rgba(5,150,105,0.2)` / `shadow-lg shadow-primary/20`): Primary buttons — a colored emerald-tinted lift.
- **Emerald glow** (`0 0 5px → 0 0 20px` Active/Glow Emerald, animated): State-only emphasis (live session, focus). Never ambient.

### Named Rules
**The Soft-Diffusion Rule.** Shadows are broad, low-opacity, and blurred — never tight or dark. If a shadow reads as a hard 2014-style drop shadow (small blur, high opacity), it's wrong. Glow is a *response to state*, not a resting decoration.

## 5. Components

### Buttons
- **Shape:** Fully pill-shaped (`rounded-full`, 9999px). Soft and tactile; `active:scale-95` and a 300ms transition give a gentle press.
- **Primary:** Translucent Trust Emerald fill (`bg-primary/80` + `backdrop-blur-md`), white text, emerald action-lift shadow, hairline white border (`border-white/20`); hover deepens toward Active Emerald (`bg-primary/90`). Sizes: sm (h-9 / 36px), md (h-12 / 48px), lg (h-14 / 56px), icon (40×40).
- **Outline:** Transparent with a 2px Trust Emerald border at 50% and emerald text; hover fills to `primary/10`.
- **Ghost:** No fill; hover gets a faint zinc wash. For low-emphasis actions.
- **Danger:** Translucent Alert Red, white text — destructive only.

### Cards / Containers
- **Corner Style:** Generous — cards `rounded-2xl` (16px), modals `rounded-3xl` (24px).
- **Background:** Frosted Glass (`bg-glass-card`, translucent white gradient) with `backdrop-blur-md`. The `highlight` variant uses a faint emerald gradient (`from-primary/10 to-accent/10`); `ghost` is nearly transparent.
- **Shadow Strategy:** Ambient glass (see Elevation). Flat-feeling, floating, soft.
- **Border:** Glass Border (translucent white) — a barely-visible edge, never a hard line.
- **Internal Padding:** 16px (`p-4`).

### Inputs / Fields
- **Style:** 44px tall (`h-11`), `rounded-xl` (12px), transparent background, Hairline border (zinc-200 / zinc-800 dark).
- **Focus:** A 2px Trust Emerald focus ring (`focus-visible:ring-2 ring-primary`) — clear and keyboard-visible, no glow.
- **Error:** Alert Red border + ring; the label and an animated helper line turn red. Required fields get a red `*`.
- **Label:** Label style (xs / 500), Muted Slate, sits above the field with 8px gap.

### Navigation
- **Bottom tab bar** (`BottomNav`) is the primary app-shell nav: fixed to the bottom, icon + label per destination, Trust Emerald for the active tab and Muted Slate for the rest. Respects `pb-safe` (safe-area inset). This is the signature product chrome — calm, thumb-reachable, always present.

## 6. Do's and Don'ts

### Do:
- **Do** rest everything on **Mint Paper** (#ecfdf5), not stark white — the emerald tint is what keeps the product calm instead of clinical.
- **Do** keep emerald the single brand hue; express hierarchy with weight and translucency, not new colors.
- **Do** use frosted glass + soft ambient shadow for depth; keep blurs soft and shadows low-opacity.
- **Do** keep body text ≥14px and provide visible 2px emerald focus rings for keyboard users (WCAG 2.2 AA).
- **Do** reserve **Alert Red** for destructive/error states only — its rarity is the point.

### Don't:
- **Don't** look like a **cold, dense clinical EHR** (Epic / MyChart): no cramped gray data tables, no jargon-dense forms, no dropdown mazes, no institutional coldness. *(PRODUCT.md anti-reference.)*
- **Don't** let the frosted glass and emerald glow tip into hype or decoration — *calm over clever*. If a glow isn't communicating live state, remove it.
- **Don't** introduce a second accent hue, multi-color category tags, or purple/blue gradients. **The One Hue Rule** holds.
- **Don't** use hard, dark, small-blur drop shadows; if it looks like a 2014 app card, the shadow is wrong (**The Soft-Diffusion Rule**).
- **Don't** convey status by color alone (e.g. body-map/session indicators) — pair with text or icon for color-blind users.
