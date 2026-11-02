# HODL — We Never Sell (Next.js + TypeScript)

Next.js 14 (App Router) · React 18 · TypeScript (strict) · Three.js 0.158

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (type-check + lint included)
npm start          # serve the production build
npm run typecheck  # tsc --noEmit
```

Deploy on Vercel (zero config), or any Node host with `npm run build && npm start`.
The home page is pre-rendered as static HTML.

## Project layout

```
app/
  layout.tsx            <html>, metadata, viewport, font preload
  page.tsx              renders <HodlSite />
  globals.css           all styles; design tokens in :root; @font-face → /public/fonts
components/
  HodlSite.tsx          'use client' root: renders the sections, starts/stops the engine
  sections/             one component per section (pure markup, no state)
    Intro  Overlays  Nav  Menu  Hero  Statement  Vault  Mechanics  Reinvest
    Collection  DiamondHands  Community  Verify  Finale  Footer
data/
  products.ts           typed store products (featured + lookbook)
lib/engine/
  types.ts              typed public API (EngineHandle, DiamondOptions, DiamondHandle)
  engine.ts             interactive engine (hero scene, soldier, vault, sections)
  diamond.ts            Three.js diamond-hands scene + steal game (code-split)
public/
  fonts/                Archivo, Figtree, Space Mono (woff2)
  img/                  product photos
```

## How it fits together

- Sections are plain JSX. Interactive elements carry `data-k="…"` (and a few `data-*`) hooks.
- `HodlSite` dynamically imports `lib/engine/engine.ts` inside `useEffect` (client only, its own
  chunk) and calls `initEngine(root)`. On unmount it calls `destroy()`, which stops loops, removes
  listeners and the injected SVG/canvas layers.
- The engine lazy-imports `lib/engine/diamond.ts` (and `three`) only when the diamond-hands
  section approaches the viewport, so the 3D code never blocks first paint.
- `reactStrictMode` is off in `next.config.mjs` because the dev-only double mount would start
  the imperative engine twice.

**Keep the `data-k` attributes** when restyling or restructuring markup — they are the contract
between the components and the engine. Text, classes and layout can change freely.

### TypeScript note

App code (`app/`, `components/`, `data/`, `lib/engine/types.ts`) is strict TypeScript.
`engine.ts` and `diamond.ts` are a faithful port of the original imperative animation code and
start with `// @ts-nocheck`; their boundary is typed through `types.ts`. They can be migrated to
fully typed classes module-by-module (e.g. `Soldier`, `Door`, `CandleFX`) without touching the
components.

## Editing common things

| Change | Where |
|---|---|
| Copy / headlines | `components/sections/*.tsx` |
| Colours, fonts, spacing | `app/globals.css` (`:root`) |
| Store products & prices | `data/products.ts` + images in `public/img/` |
| Wallet addresses | `components/sections/Verify.tsx` |
| Steal-game difficulty | `lib/engine/diamond.ts` → `Diamond.prototype.frame`: chase speed `8.5`, reaction `0.07`, reach `3.4`, catch radius `0.34` |
| Auto-volley timing | `lib/engine/engine.ts` → `heroFrame` (`nextVolley`) |
| Rank thresholds | `lib/engine/engine.ts` → `RANKS` |

## Behaviour reference

- **Hero** — illustrated SVG scene. Guard fires green candles that build a chart; chart full →
  victory pose. Hover the vault → guard aims at you; click/tap it → warning shots, door slams.
  Scroll down → vault seals. Menu → vault seals and guard checks both flanks.
- **Nav** — SELL dodges the cursor (click → DENIED). Sound is opt-in.
- **01 Vault** — scroll-scrubbed: buyback conveyor → coins into vault → door rolls shut → SEALED.
- **02 Fees** — allocation simulator (illustration, not live data).
- **03 Reinvest** — SOL/HODL payout mock (illustration).
- **04 Collection** — featured product + drag-to-browse lookbook.
- **Diamond hands** — scroll drops the token, crystal hands close: NEVER SELL. Grab the token and
  fling it out of frame before the hands catch it (Steals / Blocked score).
- **05 Community** — hold-to-enlist (3 s).
- **06 Verify** — addresses declassify on scroll; copy buttons.
- **07 Finale** — guard salutes before the sealed vault.

Accessibility/perf: `prefers-reduced-motion` disables auto-fire and 3D; no WebGL → static
fallback; low-FPS devices switch to a lite mode automatically.

Product data and prices are a snapshot of the HODLindustries Shopify store (2026-10-31).
