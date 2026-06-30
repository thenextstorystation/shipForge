# Changelog

All notable changes to TheDeveloper are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — Unreleased

> First public release. Sprints 1–4 complete. Foundation, animation engine, hero/preloader, and app showcase scroll journey are shipped. Sprints 5–6 (app detail pages, contact section, SEO polish, and accessibility audit) are in progress.

---

### Added

#### Infrastructure & Foundation
- Next.js 14 App Router project scaffold with TypeScript strict mode enabled
- Path aliases configured: `@/components`, `@/lib`, `@/styles`
- `.env.example` committed; `.env.local` and `.next/` excluded from version control
- Vercel project linked to repository with preview deployments on every pull request
- GitHub Actions CI pipeline: type-check (`pnpm tsc --noEmit`) and build (`pnpm build`) on every PR targeting `main`
- Core dependencies pinned at exact versions: `gsap@3.12.5`, `embla-carousel-react@8.1.7`, `zod@3.23.8`, `@vercel/postgres@0.10.0`

#### Design System
- Full design token set translated from `design-tokens.json` into CSS custom properties in `styles/globals.css`
- Tokens cover: background layers (`--void`, `--deep`, `--surface`, `--elevated`), four accent palettes (`plasma`, `ember`, `aurora`, `gold`) each with base, dim, bright, glow, and soft variants, text hierarchy (`--t1` through `--tm`), border scale, gradient presets, typography families, radius scale, spacing helpers, and easing curves
- CSS base reset, body defaults (`#020204` background, antialiasing, overflow-x hidden), anchor and button resets, and custom scrollbar styling
- Ambient background scene: fixed CSS-animated mesh gradient, five drifting blurred orbs with independent drift keyframes, 64px subtle grid overlay, and radial vignette — all rendered without JavaScript, `pointer-events: none`, `aria-hidden`
- Full `prefers-reduced-motion` CSS override block disabling all animation durations to `0.01ms`

#### TypeScript Type System
- `lib/content/types.ts` — canonical leaf module (zero imports): `AccentKey`, `AppCategory`, `Feature`, `Screenshot`, `AppEntry`, `ContactFormInput`, `ContactSubmission`, `ContactApiSuccess`, `ContactApiError`, `ContactApiResponse`

#### Content Layer
- `lib/content/apps.ts` — single source of truth `AppEntry[]` array, zero imports from components or animation modules
- Three development placeholder entries covering `plasma`, `ember`, and `aurora` accent keys and `Web App`, `Mobile — iOS`, and `Chrome Extension` categories
- `lib/content/metadata.ts` — `generateHomeMetadata()` and `generateAppMetadata(slug)` functions producing Next.js `Metadata` objects with Open Graph and Twitter Card fields

#### Database
- `lib/db/schema.sql` — `contact_submissions` table DDL with `pgcrypto` UUID primary key, field-level `CHECK` constraints, and `created_at DESC` index
- `lib/db/client.ts` — single `@vercel/postgres` connection pool with startup guard (throws descriptive error on missing `DATABASE_URL`)
- `lib/db/contact.ts` — `insertContactSubmission(data): Promise<string>` using parameterised template literal queries, returns inserted UUID

#### Validation
- `lib/validation/contact.ts` — Zod schema for `ContactFormInput` with trim, min/max, and email constraints; honeypot `_hp` field typed as optional; `ContactSchemaInput` inferred type alias exported

#### API
- `POST /api/contact` route handler: honeypot check first (silent 200, no DB write on non-empty `_hp`), Zod validation with per-field error mapping (400), DB insert with UUID response (200), internal errors logged server-side with generic 500 response — no stack traces in response body
- `GET`, `PUT`, `DELETE` handlers returning explicit 405 responses

#### Route Layer
- `app/layout.tsx` — root layout with `lang="en"`, global CSS import, ambient background scene, and `.page` wrapper
- `app/page.tsx` — home page server component delegating to `HomeClient` with full `apps` array
- `app/apps/[slug]/page.tsx` — static app detail page with `generateStaticParams` pre-rendering all slugs, `notFound()` for unknown slugs
- `app/not-found.tsx` — branded 404 page with gradient "404" headline, themed subtitle, and GlowButton returning to home

#### Animation Engine
- `lib/animation/reducedMotion.ts` — `prefersReducedMotion()` function (safe server-side, returns `false` when `window` unavailable) and `useReducedMotion()` React hook with `MediaQueryList` change listener
- `lib/animation/gsap.ts` — async `initGSAP()` (dynamic import, registers ScrollTrigger, sets global defaults), `scrollReveal(el, opts)` (GSAP fromTo with ScrollTrigger, respects reduced motion), `pinScene(trigger, opts)` (returns cleanup function)
- `lib/animation/particles.ts` — `ParticleSystem` class: `spawn()`, `update()` (sinusoidal drift, edge wrap, per-frame colour lerp), `render()` (radial gradient canvas draw), `setAccent(key)` (shifts target RGB for all particles), `start()` / `stop()` (RAF loop with reduced-motion static-frame guard), `resize(w, h)` (redistributes particles proportional to canvas area, capped at 120)
- `lib/animation/AccentContext.tsx` — React context providing `activeAccent: AccentKey`, `useAccent()` read hook, and `useSetAccent()` write hook; memoised to prevent unrelated re-renders

#### Public Assets
- Placeholder asset directory structure: `public/apps/placeholder-one/`, `placeholder-two/`, `placeholder-three/` each containing `icon.png` (512×512) and `screenshots/01.webp`, `02.webp`, `03.webp` (1280×800)

---

### Architecture Decisions Recorded

- All content pages (`/` and `/apps/[slug]`) are fully statically generated; only `/api/contact` runs as a serverless function — eliminates server latency on the critical visual path
- App content is a TypeScript array (zero-latency, autocomplete, trivially extensible) rather than a database table — CMS is out of scope for V1
- GSAP and ScrollTrigger are dynamically imported (client-side only) to prevent SSR hydration conflicts
- Particle system implemented as a vanilla 2D canvas class rather than Three.js — delivers the visual effect at a fraction of the bundle cost (~600 KB saved)
- `lib/db/` modules are server-only; only the contact route handler is permitted to import them
- View Transitions API targeted for page navigation with GSAP fallback for unsupported browsers

---

### Not Yet Shipped (planned for 1.0.0)

- Preloader component (`components/preloader/Preloader.tsx`)
- Hero section and particle canvas component (`components/hero/`)
- App showcase scroll journey components (`components/showcase/`)
- App detail page components (`components/detail/`)
- Contact section and form (`components/contact/`)
- Nav component and custom cursor (`components/layout/`)
- Reusable UI primitives: `GlowButton`, `EyebrowLabel`, `SectionReveal`, `VideoModal`
- `GSAPProvider` layout component
- SEO Open Graph image generation (`opengraph-image.tsx` routes)
- Accessibility audit and WCAG contrast verification
- Performance audit: Lighthouse scores, image optimisation, bundle analysis
- Real app content entries (replacing the three placeholders)
- Production deployment verification on Vercel

---

[1.0.0]: https://github.com/[owner]/thedeveloper/releases/tag/v1.0.0
