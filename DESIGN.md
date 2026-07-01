# YouTube Bank Design System

## 1. Atmosphere & Identity

YouTube Bank is a calm learning operations tool: quiet by default, precise when a user is configuring APIs or reading generated notes. The signature is a white command-surface with red YouTube-origin accents and restrained zinc neutrals.

## 2. Color

| Role | Token | Light | Usage |
|------|-------|-------|-------|
| Surface primary | `--background` | `#ffffff` | Root page background |
| Surface secondary | `zinc-50` | `#fafafa` | App canvas and low-emphasis panels |
| Surface elevated | `white` | `#ffffff` | Cards, nav, forms |
| Text primary | `zinc-950` | `#09090b` | Titles and primary controls |
| Text secondary | `zinc-600` | `#52525b` | Body copy and metadata |
| Text muted | `zinc-400` | `#a1a1aa` | Disabled controls |
| Border default | `zinc-200` | `#e4e4e7` | Cards, inputs, nav |
| Accent primary | `red-600` | `#dc2626` | Primary actions, active nav, focus |
| Accent subtle | `red-50` | `#fef2f2` | Active and selected surfaces |
| Success | `emerald-700` | `#047857` | Saved/valid states |
| Warning | `amber-800` | `#92400e` | Missing-key banners |
| Info | `sky-800` | `#075985` | Informational banners |

Rules: use red only for product-primary actions and active state. Avoid blue/purple gradients except legacy surfaces being phased out.

## 3. Typography

Font stack: Geist Sans via `next/font`, fallback `system-ui, sans-serif`. Mono: Geist Mono.

| Level | Size | Weight | Line height | Usage |
|-------|------|--------|-------------|-------|
| H1 | `text-2xl md:text-3xl` | 700 | tight | Page titles |
| H2 | `text-xl md:text-2xl` | 600 | snug | Section titles |
| H3 | `text-lg xl:text-xl` | 600 | snug | Card titles |
| Body | `text-base` | 400 | relaxed | Default copy |
| Body small | `text-sm` | 400-500 | relaxed | Metadata, helper copy |
| Caption | `text-xs` | 500 | normal | Labels, timestamps |

## 4. Spacing & Layout

Base unit: 4px. Primary content width is `max-w-6xl`; focused setup/settings screens use `max-w-5xl` or narrower. Page padding is `px-4 py-6 md:px-6`; cards use `p-5 md:p-6`; compact controls use `gap-2` and panels use `gap-4` or `gap-6`.

## 5. Components

### Global navigation
- Structure: logo, desktop nav links, settings action, language toggle, mobile menu.
- States: active `red-50/red-700`, hover `zinc-100`, disabled `zinc-400`, focus uses red ring.
- Accessibility: semantic `nav`; mobile menu closes on link selection.

### Page shell
- Structure: `min-h-screen bg-zinc-50` with constrained inner content.
- States: loading, empty, error, authenticated content.
- Accessibility: root skip link targets `#main-content`.

### Landing hero
- Structure: first viewport uses a full-bleed photorealistic learning image with headline and primary action over the image, not inside a card.
- States: unauthenticated, Google sign-in loading, inline sign-in error.
- Accessibility: image alt describes the learning context; text contrast is protected by a dark directional overlay.

### Cards and panels
- Structure: white or subtle-tint surface, `rounded-2xl`, `border-zinc-200`, `shadow-sm`.
- States: hover may raise to `shadow-md`; destructive actions stay red.
- Accessibility: icons are supporting decoration; text carries the meaning.

### Forms
- Structure: labels above inputs, helper text below, validation inline.
- States: default, focus, disabled, validating, invalid.
- Accessibility: inputs keep visible labels and focus rings.

## 6. Motion & Interaction

Use 150-300ms transitions on color, opacity, and transform only. Avoid decorative motion. Respect `prefers-reduced-motion` by keeping animation non-essential.

## 7. Depth & Surface

Strategy: mixed but restrained. Most hierarchy comes from tonal shift and thin borders. Use `shadow-sm` for primary cards and `shadow-md` only on hover/elevated states.

## Current design debt

- Trend dashboard still contains legacy blue-gradient setup and filter surfaces.
- Some visible strings still use emoji-like country flags or symbolic text in controls.
- Some errors still use `alert()` instead of inline recovery panels.
