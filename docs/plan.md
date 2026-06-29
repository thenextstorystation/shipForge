# TheDeveloper — Build Plan
*Produced by Otto, Engineering Manager @ ShipForge*

---

## Estimate Summary

| Item | Value |
|---|---|
| **Total tickets** | 47 |
| **Total story points** | 198 |
| **Sprints** | 6 × 1-week sprints |
| **Calendar duration** | 6 weeks |
| **Velocity assumption** | ~33 SP/week (1 senior full-stack dev + 1 frontend specialist) |
| **Rough cost** | ~120 dev-hours @ market rate |

**Point scale:** 1 = trivial (<1 hr) · 2 = small (1–2 hr) · 3 = medium (half-day) · 5 = large (full day) · 8 = complex (1.5–2 days) · 13 = epic (3+ days, must be split if possible)

---

## Sprint Map

| Sprint | Theme | Points |
|---|---|---|
| S1 | Foundation — repo, types, tokens, DB, CI | 31 |
| S2 | Animation engine + core layout shell | 35 |
| S3 | Hero + Preloader + particle system | 33 |
| S4 | App Showcase scroll journey | 38 |
| S5 | App Detail pages + Contact section | 38 |
| S6 | Polish, SEO, accessibility, performance, deploy | 23 |
| **Total** | | **198** |

---

## Sprint 1 — Foundation
*Goal: Everything that blocks every other ticket ships this week. Zero UI. All infrastructure, types, tokens, and data contracts locked.*

---

### S1-01 · Repo & project scaffold
**Owner:** Axel (Infra)
**Points:** 3

Tasks:
- `npx create-next-app@14` with TypeScript, App Router, Tailwind prompt declined
- Configure `tsconfig.json`: `strict: true`, path aliases (`@/components`, `@/lib`, `@/styles`)
- Add `.env.example` with `DATABASE_URL=`
- Add `.gitignore` entries for `.env.local`, `.next/`, `node_modules/`
- Commit initial scaffold to `main`, open Vercel project, link repo

**Acceptance:** `pnpm dev` starts, `/` returns 200, repo visible in Vercel dashboard, branch protection on `main` requires PR.

---

### S1-02 · Install & pin core dependencies
**Owner:** Axel (Infra)
**Points:** 2

Packages to install and pin exact versions:
- `gsap` (ScrollTrigger bundled)
- `embla-carousel-react`
- `zod`
- `@vercel/postgres`
- `next` (already present — confirm 14.x)

**Acceptance:** `pnpm install` clean, `package.json` shows exact versions (no `^`), `pnpm audit` passes with zero critical.

---

### S1-03 · Design tokens → globals.css
**Owner:** Nova (Frontend)
**Points:** 3

- Translate all values from `docs/design-tokens.json` into CSS custom properties in `styles/globals.css`
- Include: color groups (background, accent, text, border, gradient), typography scale variables, spacing variables, radius variables, easing variables
- Add base reset, `html`/`body` background, scrollbar styling, `font-smoothing`, `box-sizing`
- Import `globals.css` in `app/layout.tsx`

**Acceptance:** DevTools shows `--plasma`, `--void`, `--t1`, etc. on `:root`. No layout shift. Body background is `#020204`.

---

### S1-04 · TypeScript canonical types
**Owner:** Axel (Infra)
**Points:** 2

- Create `lib/content/types.ts` with exact interfaces from HLD §2.2: `AccentKey`, `AppCategory`, `Feature`, `Screenshot`, `AppEntry`, `ContactFormInput`, `ContactSubmission`, `ContactApiSuccess`, `ContactApiError`, `ContactApiResponse`
- Zero imports from anywhere in the project (leaf module rule)

**Acceptance:** `pnpm tsc --noEmit` passes. `types.ts` has no import statements except built-in TypeScript utility types.

---

### S1-05 · Content layer — apps.ts scaffold
**Owner:** Axel (Infra)
**Points:** 3

- Create `lib/content/apps.ts` exporting `apps: AppEntry[]`
- Populate with **3 placeholder entries** (slug: `placeholder-one`, `placeholder-two`, `placeholder-three`) with all required fields filled with realistic dummy data
- Each placeholder gets a different `accentKey`
- Asset paths follow convention (`/apps/placeholder-one/icon.png`, etc.) — files do not need to exist yet
- Zero imports from `components/`, `app/`, or `lib/animation/`

**Acceptance:** `import { apps } from '@/lib/content/apps'` in a test file compiles. `apps.length === 3`. `pnpm tsc --noEmit` passes.

---

### S1-06 · Placeholder public assets
**Owner:** Nova (Frontend)
**Points:** 2

- Create folder structure `public/apps/placeholder-one/screenshots/`, `placeholder-two/`, `placeholder-three/`
- Add 512×512 PNG placeholder icons (solid accent color per entry, white "APP" text) for each
- Add 3 WebP placeholder screenshots per app (1280×800, solid dark gradient with app name text)
- Add placeholder `demo.mp4` symlink or note (skip file for now, `videoUrl: null` in entries)

**Acceptance:** `http://localhost:3000/apps/placeholder-one/icon.png` returns an image. No 404 for any path referenced in `apps.ts`.

---

### S1-07 · Database schema + migration
**Owner:** Axel (Infra)
**Points:** 3

- Create `lib/db/schema.sql` with exact DDL from HLD §2.1
- Create `lib/db/client.ts`: single `@vercel/postgres` pool, reads `DATABASE_URL`, throws descriptive error if missing
- Run schema against provisioned Neon/Supabase instance (document the one-time run command in README)
- Create `lib/db/contact.ts`: `insertContactSubmission(data: ContactFormInput): Promise<string>` using parameterised query, returns inserted UUID

**Acceptance:** `contact_submissions` table exists in Postgres. Calling `insertContactSubmission` from a local test script inserts a row and returns a UUID string.

---

### S1-08 · Zod validation schema
**Owner:** Axel (Infra)
**Points:** 2

- Create `lib/validation/contact.ts`
- Export `contactSchema` (Zod object matching `ContactFormInput` with constraints from HLD §1.1)
- Export `ContactSchemaInput` inferred type alias
- No other business logic in this file

**Acceptance:** Valid input passes `.parse()`. Missing email fails with field-level error message. Message over 2000 chars fails.

---

### S1-09 · POST /api/contact route handler
**Owner:** Axel (Infra)
**Points:** 5

- Create `app/api/contact/route.ts`
- Export only `POST` function; all other methods return 405 immediately
- Honeypot check (`_hp` field) first — if non-empty return `200 { ok: true }` with no DB write
- Validate with `contactSchema` from `lib/validation/contact.ts` — on failure return 400 with field errors
- On success call `insertContactSubmission`, return `200 { ok: true, id }`
- `console.error` on DB errors, return 500 with `INTERNAL_ERROR` — no stack traces in response

**Acceptance:** `curl -X POST /api/contact -d '{"name":"A","email":"a@b.com","message":"Hello"}' -H 'Content-Type: application/json'` returns `{ ok: true, id: "<uuid>" }`. Row exists in DB. Bad email returns 400 with `fields.email` populated. `curl -X GET /api/contact` returns 405.

---

### S1-10 · Root layout shell
**Owner:** Nova (Frontend)
**Points:** 3

- Create `app/layout.tsx` with `lang="en"` on `<html>`
- Wire `next/font` for system fonts with `display: 'swap'` (Syne, Inter, JetBrains Mono — confirm availability or substitute with `next/font/google`)
- Import `globals.css`
- Render `{children}` inside a `<main>` wrapper with class `page`
- Add `<div className="bg-scene">` with `.bg-mesh`, `.orb-1`–`.orb-5`, `.bg-grid`, `.bg-vignette` structure (CSS-only, no canvas yet)
- Add placeholder `<nav>` returning `null` for now (Nav.tsx shell)

**Acceptance:** `pnpm dev` — `/` renders with `#020204` background, drifting orb animations visible, no hydration warnings in console.

---

### S1-11 · Metadata utility
**Owner:** Axel (Infra)
**Points:** 3

- Create `lib/content/metadata.ts`
- Export `generateHomeMetadata(): Metadata` — title "TheDeveloper", description, OG fields
- Export `generateAppMetadata(slug: string): Metadata` — per-app title, description from `apps.ts`, OG fields
- Wire `generateMetadata` export in `app/page.tsx` (stub page) calling `generateHomeMetadata()`
- Wire `generateMetadata` in `app/apps/[slug]/page.tsx` (stub page) calling `generateAppMetadata(slug)`

**Acceptance:** `curl http://localhost:3000` response HTML contains `<title>TheDeveloper</title>` and `og:title` meta tag.

---

### S1-12 · CI pipeline
**Owner:** Axel (Infra)
**Points:** 2 (Note: infrastructure ticket, but unblocks safe merging for all future tickets)

- Add `.github/workflows/ci.yml`
- Steps: checkout → pnpm install → `pnpm tsc --noEmit` → `pnpm build`
- Run on every PR targeting `main`
- Vercel preview deployments auto-triggered by Vercel GitHub integration

**Acceptance:** Opening a PR triggers CI. A deliberate type error in a branch fails CI. Vercel preview URL appears in PR comments.

---

**Sprint 1 total: 31 SP**

---

## Sprint 2 — Animation Engine + Core Layout Shell
*Goal: GSAP wired and proven. Nav, Custom Cursor, reduced-motion guard, page transitions, and SectionReveal primitive all ship. Every future ticket can import animation helpers immediately.*

---

### S2-01 · Reduced motion guard
**Owner:** Nova (Frontend)
**Points:** 2

- Create `lib/animation/reducedMotion.ts`
- Export `prefersReducedMotion(): boolean` (reads `window.matchMedia('(prefers-reduced-motion: reduce)')`)
- Export `useReducedMotion()` React hook (listens to media query changes)
- Guard: if called server-side returns `false` safely

**Acceptance:** With OS reduced-motion ON, `prefersReducedMotion()` returns `true`. Hook updates reactively when OS setting changes.

---

### S2-02 · GSAP initialisation module
**Owner:** Nova (Frontend)
**Points:** 3

- Create `lib/animation/gsap.ts`
- Dynamically import `gsap` and `ScrollTrigger` — module is client-side only
- Export `initGSAP(): Promise<void>` — registers ScrollTrigger plugin, sets GSAP defaults (`ease: 'power2.out'`, `duration: 0.8`)
- Export `scrollReveal(el: Element, opts?: ScrollRevealOpts): void` — creates a ScrollTrigger-based fromTo animation (y: 40 → 0, opacity: 0 → 1). Calls `prefersReducedMotion()` guard first.
- Export `pinScene(trigger: Element, opts?: PinSceneOpts): ScrollTrigger` — pins a section for horizontal or vertical scroll. Returns the ScrollTrigger instance for cleanup.
- All exports are no-ops (resolve immediately) if `prefersReducedMotion()` is true

**Acceptance:** `initGSAP()` resolves without error in a `useEffect`. `scrollReveal` called on a visible div animates it in. No SSR errors. `pnpm tsc --noEmit` passes.

---

### S2-03 · Page transition helpers
**Owner:** Nova (Frontend)
**Points:** 3

- Create `lib/animation/transitions.ts`
- Export `pageEnter(el: Element): void` — fades + slides element in (View Transitions API if available, GSAP fromTo fallback)
- Export `pageExit(el: Element): void` — fades + slides element out
- Export `usePageTransition()` hook — wraps `router.push()` with exit animation before navigation
- Calls `prefersReducedMotion()` guard — skips animation if true but still navigates

**Acceptance:** Navigating from `/` to `/apps/placeholder-one` and back shows a fade-slide transition. With reduced motion OS setting ON, navigation is instant with no animation.

---

### S2-04 · Nav component
**Owner:** Nova (Frontend)
**Points:** 5

- Create `components/layout/Nav.tsx` (`"use client"`)
- Fixed position, `z-index: 50`, height `var(--nav-h)`
- Logo mark: gradient square + "TD" initials + "TheDeveloper" wordmark
- Nav links: "Work", "About" (scroll anchors), "Contact" (scroll anchor)
- CTA button: "Let's Talk" → smooth scroll to `#contact`
- Scroll-aware: below 80px scroll Y → transparent/blur minimal; above → glass background with `backdrop-filter`
- Uses `IntersectionObserver` or `window.scroll` listener for awareness
- `navReveal` entrance animation on mount (from mock.html CSS)
- Responsive: hamburger menu on mobile (< 768px), drawer overlay

**Acceptance:** Nav is visible on all pages. Glass effect activates on scroll. All anchor links scroll smoothly to their targets. Mobile hamburger opens/closes. No layout shift on mount.

---

### S2-05 · Custom cursor component
**Owner:** Nova (Frontend)
**Points:** 5

- Create `components/layout/CustomCursor.tsx` (`"use client"`)
- Desktop only (`pointer: fine` media query — renders `null` on touch devices)
- Outer ring: 40×40px, `border: 1.5px solid var(--b-plasma)`, lag-follows mouse with GSAP quickSetter
- Inner dot: 6×6px, `background: var(--plasma-b)`, snaps to mouse instantly
- Pointer state: when hovering `<a>`, `<button>` → ring scales to 60px, fills with `var(--plasma-soft)`
- Text state: when hovering text → ring morphs to thin underline cursor shape
- Mounted in `app/layout.tsx` outside `<main>`
- Hides native cursor via `cursor: none` on `body` only when component is active
- Full reduced-motion respect: if `prefersReducedMotion()` → render nothing, show native cursor

**Acceptance:** Custom cursor tracks mouse with lag on desktop. Ring enlarges over buttons. Does not render on touch devices. Native cursor hidden only on desktop.

---

### S2-06 · SectionReveal primitive
**Owner:** Nova (Frontend)
**Points:** 3

- Create `components/ui/SectionReveal.tsx` (`"use client"`)
- Props: `children`, `delay?: number`, `direction?: 'up' | 'left' | 'right'`, `className?: string`
- Uses `useRef` + `useLayoutEffect` to call `scrollReveal()` from `lib/animation/gsap.ts`
- Falls back to `IntersectionObserver` if GSAP not yet initialised
- Wraps children in a `<div>` with `will-change: transform, opacity`

**Acceptance:** Wrapping any block-level element with `<SectionReveal>` causes it to animate in when scrolled into view. Works in both reduced-motion (instant show) and normal mode.

---

### S2-07 · GlowButton primitive
**Owner:** Nova (Frontend)
**Points:** 3

- Create `components/ui/GlowButton.tsx`
- Props: `variant: AccentKey`, `children`, `href?: string`, `onClick?: () => void`, `external?: boolean`, `size?: 'sm' | 'md' | 'lg'`
- Renders `<button>` or `<a>` depending on `href` presence
- External links: `target="_blank" rel="noopener noreferrer"`
- Glow effect: box-shadow using accent glow token, intensifies on hover
- Hover: `translateY(-2px)`, glow spreads, `var(--ease-spring)` transition
- Plasma, ember, aurora, gold variants map to their respective token sets

**Acceptance:** `<GlowButton variant="plasma">Click</GlowButton>` renders purple glowing button. Hover animates correctly. Tab-focusable. External `href` opens new tab.

---

### S2-08 · EyebrowLabel primitive
**Owner:** Nova (Frontend)
**Points:** 1

- Create `components/ui/EyebrowLabel.tsx`
- Props: `children`, `dot?: boolean`, `accentKey?: AccentKey`
- Renders a `<span>` with mono font, uppercase, `letter-spacing: 0.14em`, `font-size: 0.6875rem`
- Optional pulsing dot in accent color (from mock.html `.hero-eyebrow-dot` pattern)

**Acceptance:** Renders correctly in Storybook or a test page. Dot pulses. No TS errors.

---

### S2-09 · VideoModal primitive
**Owner:** Nova (Frontend)
**Points:** 3

- Create `components/ui/VideoModal.tsx` (`"use client"`)
- Props: `isOpen: boolean`, `onClose: () => void`, `videoUrl: string`
- Full-screen overlay with `backdrop-filter: blur(24px)`, background `rgba(2,2,4,0.92)`
- Renders `<video>` for direct URLs, `<iframe>` for YouTube/Vimeo embed URLs (detect by URL pattern)
- Close: Escape key, click outside, X button
- Entrance: opacity + scale animation via GSAP (respects reduced motion)
- Traps focus while open

**Acceptance:** Opening modal shows video. Escape closes it. Focus trapped inside modal. YouTube URL renders iframe; `.mp4` URL renders `<video>`. Reduced motion: instant open/close.

---

### S2-10 · Branded 404 page
**Owner:** Nova (Frontend)
**Points:** 2

- Create `app/not-found.tsx`
- Full dark theme, centered layout
- Large "404" in display font with gradient text
- Subtitle: "This page doesn't exist in this universe."
- GlowButton variant="plasma" linking back to `/`
- Subtle orb background (CSS only, reuse bg-scene classes)

**Acceptance:** Navigating to `/nonexistent` shows the 404 page in full theme. "Go Home" button returns to `/`.

---

### S2-11 · initGSAP wired in layout
**Owner:** Nova (Frontend)
**Points:** 2

- Create a `components/layout/GSAPProvider.tsx` (`"use client"`)
- Calls `initGSAP()` in `useLayoutEffect` once on mount
- Mounts in `app/layout.tsx` above `{children}`
- Ensures ScrollTrigger is registered before any child component tries to use it

**Acceptance:** No "ScrollTrigger not registered" console errors. `gsap.version` logs correctly from any child component's `useLayoutEffect`.

---

**Sprint 2 total: 35 SP**

---

## Sprint 3 — Hero, Preloader & Particle System
*Goal: The site's first impression — everything a visitor sees in the first 10 seconds — is complete and wow-worthy.*

---

### S3-01 · Particle system class
**Owner:** Nova (Frontend)
**Points:** 8

- Create `lib/animation/particles.ts` (no React, no JSX — pure class)
- `ParticleSystem` class: constructor takes `canvas: HTMLCanvasElement`
- `spawn(count: number)`: creates particles with random position, velocity, size (2–6px), opacity, and initial accent color
- `update()`: advances position, wraps at edges, fades out and respawns, applies subtle drift sinusoidally
- `render()`: draws each particle as a blurred radial gradient circle on canvas 2D context
- `setAccent(key: AccentKey)`: smoothly shifts particle color toward new accent using linear interpolation per-frame
- `start()` / `stop()`: requestAnimationFrame loop
- `resize(w: number, h: number)`: resets canvas dimensions, redistributes particles
- Particle count scales with canvas area (cap at 120 particles)
- `prefersReducedMotion()` check in `start()` — if true, render single static frame and stop

**Acceptance:** `new ParticleSystem(canvas).start()` shows drifting glowing particles on canvas. `setAccent('ember')` shifts colors smoothly over ~2 seconds. No memory leak (RAF cancelled on `stop()`). Reduced motion: static frame only.

---

### S3-02 · ParticleCanvas component
**Owner:** Nova (Frontend)
**Points:** 3

- Create `components/hero/ParticleCanvas.tsx` (`"use client"`)
- Renders a `<canvas>` absolutely positioned to fill parent, `pointer-events: none`, `z-index: 0`
- Instantiates `ParticleSystem` in `useLayoutEffect`, calls `start()`
- Listens to window resize → calls `resize()`
- Calls `stop()` in cleanup
- Exports `ParticleCanvasHandle` ref interface with `setAccent(key: AccentKey)` method via `useImperativeHandle`
- Wrapped in `dynamic(() => import(...), { ssr: false })` at its own file level via re-export in an index file — or enforced at call site

**Acceptance:** `<ParticleCanvas />` renders particles. Resizing window redistributes particles without artifact. Component cleanup removes RAF loop. `ref.setAccent('aurora')` shifts to teal particles.

---

### S3-03 · Hero section
**Owner:** Nova (Frontend)
**Points:** 8

- Create `components/hero/HeroSection.tsx` (`"use client"`)
- Full-screen layout matching mock.html `#hero` section exactly
- Elements (each independently animated with GSAP timeline, staggered):
  1. `<ParticleCanvas />` (background layer)
  2. `.hero-rings` — three concentric rotating rings (CSS animation from mock.html)
  3. `.hero-spotlight` — radial glow behind title
  4. Eyebrow pill: `<EyebrowLabel dot>` — "Portfolio · 2024"
  5. Hero title: "The Developer" in `7xl` display weight, gradient text clip (`--brand` gradient)
  6. Tagline: 1–2 line subtitle in `--t2` color, `lg` body size
  7. Scroll hint: animated chevron-down with "Scroll to explore" label, subtle bounce animation
- GSAP entrance timeline: elements stagger in over 1.4s from page load
- Hero is `id="hero"` for nav anchor link

**Acceptance:** Hero fills viewport. All 7 elements present. GSAP stagger animates them in sequence. Rings rotate (CSS). Particles visible in background. Scroll hint bounces. Mobile: title scales down gracefully via `clamp()`.

---

### S3-04 · Preloader component
**Owner:** Nova (Frontend)
**Points:** 8

- Create `components/preloader/Preloader.tsx` (`"use client"`)
- Full-screen overlay, `position: fixed`, `z-index: 100`, background `var(--void)`
- Phase 1 (0–0.6s): blank screen
- Phase 2 (0.6–1.8s): "TheDeveloper" characters animate in one by one using GSAP stagger (each char is a `<span>`, opacity 0→1, y: 20→0, stagger: 0.06s)
- Phase 3 (1.8–2.5s): progress bar fills left to right using a slim line in `--plasma` color
- Phase 4 (2.5–2.8s): brief hold
- Phase 5 (2.8–3.2s): entire overlay fades out + scales slightly (opacity 1→0, scale 1→0.96)
- After exit: `onComplete` callback fires, component unmounts (controlled by parent state in `app/page.tsx`)
- Reduced motion: skip all animation phases, immediately call `onComplete` after 400ms

**Acceptance:** On first load, preloader covers screen. Characters animate in. Progress bar fills. Overlay fades out to reveal hero. Hero is not visible during preloader. Reduced motion: instant reveal after 400ms.

---

### S3-05 · Home page assembly (Preloader + Hero)
**Owner:** Nova (Frontend)
**Points:** 3

- Update `app/page.tsx` (server component outer shell)
- Mount `<Preloader>` controlled by `useState(showPreloader)` in a `"use client"` wrapper component `HomeClient.tsx`
- When preloader `onComplete` fires → set `showPreloader = false`, trigger hero entrance
- Mount `<HeroSection>` below preloader (hidden until preloader exits)
- Stub placeholders for `<AppShowcase>` and `<ContactSection>` (empty divs with section IDs for now)
- Page has `id="work"` anchor at showcase position, `id="contact"` at contact position

**Acceptance:** Full preloader → hero reveal flow works end to end. No flash of unstyled content. No hydration mismatch. Hero is accessible once preloader exits.

---

### S3-06 · Particle accent bus
**Owner:** Nova (Frontend)
**Points:** 2

- Create a lightweight React context `lib/animation/AccentContext.tsx` (`"use client"`)
- `AccentProvider` wraps the page, stores `activeAccent: AccentKey`
- `useSetAccent()` hook — lets `AppScrollScene` push new accent when its scene becomes active
- `useAccent()` hook — `ParticleCanvas` subscribes and calls `setAccent()` on change
- Provider mounted in `HomeClient.tsx`

**Acceptance:** Calling `useSetAccent()('ember')` from any child causes `ParticleCanvas` to shift particle colors to ember. No prop drilling. Context does not re-render unrelated components (memoised).

---

**Sprint 3 total: 33 SP**

---

## Sprint 4 — App Showcase Scroll Journey
*Goal: The core product experience. All scroll-triggered app reveal scenes, full scroll journey, fluid transitions between apps.*

---

### S4-01 · AppScrollCard component
**Owner:** Nova (Frontend)
**Points:** 5

- Create `components/showcase/AppScrollCard.tsx` (`"use client"`)
- Props: `app: AppEntry`, `isActive: boolean`
- Layout (two-column on desktop, stacked on mobile):
  - Left: app icon (80px, `r-icon-xl`), eyebrow label (category + year), app name (`3xl` display), tagline (`lg` body, `--t2`), `<GlowButton variant={app.accentKey}>` "See Full Story" linking to `/apps/[slug]`
  - Right: hero screenshot in a styled frame (rounded, subtle glow border in accent color, slight tilt on desktop)
- All elements start invisible; parent `AppScrollScene` drives their entrance via GSAP
- Exposes `animateIn()` and `animateOut()` via `useImperativeHandle` ref

**Acceptance:** Card renders all required fields. `animateIn()` staggers left-column elements in, then screenshot slides in from right. `animateOut()` reverses. Correct accent glow on screenshot frame. Mobile: single column, no tilt.

---

### S4-02 · AppScrollScene component
**Owner:** Nova (Frontend)
**Points:** 8

- Create `components/showcase/AppScrollScene.tsx` (`"use client"`)
- Props: `app: AppEntry`, `index: number`
- Wraps one `AppScrollCard` in a full-screen pinned section (height: `200vh` scroll space, pinned for `100vh`)
- Uses `pinScene()` from `lib/animation/gsap.ts` to pin the scene
- ScrollTrigger `onEnter`: calls `card.animateIn()`, calls `useSetAccent()(app.accentKey)`
- ScrollTrigger `onLeave`: calls `card.animateOut()`
- ScrollTrigger `onEnterBack`: calls `card.animateIn()`
- ScrollTrigger `onLeaveBack`: calls `card.animateOut()`
- Background accent gradient (from `design-tokens.json` `gradient.app-[key]`) fades in/out with scene
- Alternates card layout direction (even index = image right, odd index = image left) via prop to `AppScrollCard`
- Cleanup: kills ScrollTrigger instance in `useLayoutEffect` return

**Acceptance:** Scrolling through the scene keeps the card pinned for exactly one viewport height of scroll. Accent gradient behind card matches `app.accentKey`. Entering/leaving triggers correct animations. No memory leak on unmount.

---

### S4-03 · AppShowcase orchestrator
**Owner:** Nova (Frontend)
**Points:** 3

- Create `components/showcase/AppShowcase.tsx` (server component)
- Props: `apps: AppEntry[]`
- Renders one `<AppScrollScene>` per app entry, in array order
- Wraps the sequence in a `<section id="work">` container
- Section has a subtle entry eyebrow: "Selected Work · [count] Applications"

**Acceptance:** All 3 placeholder apps render as sequential pinned scroll scenes. Scrolling through shows app 1, then 2, then 3 sequentially. No overlap or z-index conflicts.

---

### S4-04 · Wire AppShowcase into home page
**Owner:** Nova (Frontend)
**Points:** 2

- Import `<AppShowcase apps={apps} />` in `app/page.tsx`
- Pass full `apps` array from `lib/content/apps.ts`
- Ensure `<AppShowcase>` is below `<HeroSection>` in DOM order
- Verify scroll journey is continuous: hero → app 1 → app 2 → app 3 → contact stub

**Acceptance:** Full scroll journey works. GSAP ScrollTrigger instances do not conflict with each other. No jank or position jumps between sections.

---

### S4-05 · Between-scene transition gradients
**Owner:** Nova (Frontend)
**Points:** 3

- Add inter-scene transition elements between each `AppScrollScene`
- A short `40vh` section between scenes with a gradient fade from current accent to `var(--void)` and back
- These are purely decorative divs — no content, no pinning
- Particle canvas accent shifts during this transition zone (linear interpolation between two accent keys)

**Acceptance:** Scrolling between app scenes shows a smooth color breath — no hard cuts. Particle color smoothly interpolates.

---

### S4-06 · Scroll progress indicator
**Owner:** Nova (Frontend)
**Points:** 3

- Add a fixed vertical progress bar on the right edge of the viewport (2px wide, full viewport height)
- Fills from top in the current active accent color as user scrolls through the showcase
- Dot marker shows current position within the showcase (one dot per app, clicking dot scrolls to that scene)
- Hides outside the showcase section (fades out above hero, fades out below last app scene
