# TheDeveloper — High-Level Design
*Prepared by Hugo, Tech Lead @ ShipForge*

---

## 1. API Contracts

### 1.1 POST `/api/contact`

**Purpose:** Persist a contact form submission to Postgres.

**Method:** `POST`
**Path:** `/api/contact`
**Handler:** `app/api/contact/route.ts`
**Runtime:** Vercel Serverless Function (Node.js 20)

---

**Request**

```
Content-Type: application/json
```

```jsonc
{
  "name":    "Jane Smith",          // string, 1–100 chars, required
  "email":   "jane@example.com",    // string, valid email, required
  "message": "Hello, let's talk."   // string, 1–2000 chars, required
}
```

Field constraints enforced by Zod on the server:

| Field | Type | Min | Max | Validation |
|---|---|---|---|---|
| `name` | string | 1 | 100 | `.trim()`, non-empty |
| `email` | string | 6 | 254 | `z.string().email()` |
| `message` | string | 1 | 2000 | `.trim()`, non-empty |

---

**Response — 200 OK (success)**

```jsonc
{
  "ok": true,
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"  // UUID of inserted row
}
```

**Response — 400 Bad Request (validation failure)**

```jsonc
{
  "ok": false,
  "error": "VALIDATION_ERROR",
  "fields": {
    "email": "Invalid email address",
    "message": "Required"
  }
}
```

**Response — 405 Method Not Allowed**

```jsonc
{
  "ok": false,
  "error": "METHOD_NOT_ALLOWED"
}
```

**Response — 500 Internal Server Error**

```jsonc
{
  "ok": false,
  "error": "INTERNAL_ERROR"
}
```

---

**Rate limiting:** No infrastructure rate limiting in V1. Honeypot hidden field `_hp` on the client form — if `_hp` is non-empty the handler returns `200 { ok: true }` silently without inserting (bot trap).

---

### 1.2 No other API routes exist in V1

All content is served statically. There are no GET endpoints for apps or any other resource. The contact route is the only dynamic surface.

---

## 2. Data Model

### 2.1 Table: `contact_submissions`

Location: `lib/db/schema.sql`

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS contact_submissions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL CHECK (char_length(name)    BETWEEN 1 AND 100),
  email       TEXT        NOT NULL CHECK (char_length(email)   BETWEEN 6 AND 254),
  message     TEXT        NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON contact_submissions (created_at DESC);
```

No UPDATE or DELETE operations are performed from the application. The table is append-only.

---

### 2.2 TypeScript Interfaces

Location: `lib/content/types.ts`

These are the canonical types. Every component and module imports from here — never redefines locally.

```typescript
// ─── App Content ──────────────────────────────────────────────────────────────

export type AccentKey = 'plasma' | 'ember' | 'aurora' | 'gold';

export type AppCategory =
  | 'Web App'
  | 'Mobile — iOS'
  | 'Mobile — Android'
  | 'Mobile — Cross-platform'
  | 'Desktop'
  | 'CLI Tool'
  | 'Library / SDK'
  | 'Chrome Extension';

export interface Feature {
  icon:        string;   // Single emoji or inline SVG string
  title:       string;   // 2–5 words
  description: string;   // 1–2 sentences, max 120 chars
}

export interface Screenshot {
  src:   string;         // Absolute path from public root e.g. /apps/slug/screenshots/01.webp
  alt:   string;         // Meaningful alt text
  width: number;         // px, actual image width
  height: number;        // px, actual image height
}

export interface AppEntry {
  slug:             string;        // URL-safe, kebab-case, unique e.g. "orbit-tracker"
  name:             string;        // Display name e.g. "Orbit Tracker"
  tagline:          string;        // 1 sentence, max 80 chars — used in scroll card
  description:      string;        // Full paragraph(s) for detail page, max 600 chars
  icon:             string;        // Path e.g. /apps/orbit-tracker/icon.png, 512×512 PNG
  accentKey:        AccentKey;     // Controls per-app colour shift
  category:         AppCategory;
  year:             number;        // 4-digit year of completion
  features:         Feature[];     // 3–5 items
  screenshots:      Screenshot[];  // min 3 items
  videoUrl:         string | null; // Hosted URL (YouTube embed / direct .mp4) or null
  liveUrl:          string;        // External URL — opens in new tab
  coverScreenshot:  number;        // Index into screenshots[] used as scroll-card hero
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

export interface ContactFormInput {
  name:    string;
  email:   string;
  message: string;
}

export interface ContactSubmission extends ContactFormInput {
  id:         string;   // UUID
  created_at: string;   // ISO 8601
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ContactApiSuccess {
  ok:  true;
  id:  string;
}

export interface ContactApiError {
  ok:     false;
  error:  'VALIDATION_ERROR' | 'METHOD_NOT_ALLOWED' | 'INTERNAL_ERROR';
  fields?: Partial<Record<keyof ContactFormInput, string>>;
}

export type ContactApiResponse = ContactApiSuccess | ContactApiError;
```

---

### 2.3 Content Array Contract

Location: `lib/content/apps.ts`

The file exports exactly one value:

```typescript
import type { AppEntry } from './types';

export const apps: AppEntry[] = [
  // ... entries in display order (index 0 = first scroll scene)
];
```

Rules:
- Entries are ordered by intended scroll sequence — first item appears first on the page.
- Every `slug` must be globally unique within the array.
- Every `slug` must match the subfolder name under `public/apps/`.
- `coverScreenshot` must be a valid index into that entry's `screenshots` array.
- `accentKey` values should rotate across consecutive entries to provide visual variety — avoid the same key on three consecutive entries.

---

## 3. Folder Structure

Exact paths. Every file listed has a defined responsibility. Files not listed here do not exist at project creation.

```
thedeveloper/
│
├── app/
│   ├── layout.tsx                    Root layout: fonts, global CSS, shell elements
│   ├── page.tsx                      Home: Preloader + Hero + AppShowcase + ContactSection
│   ├── not-found.tsx                 Branded 404
│   ├── opengraph-image.tsx           OG image for home route (Next.js convention)
│   │
│   ├── apps/
│   │   └── [slug]/
│   │       ├── page.tsx              App detail page (generateStaticParams)
│   │       └── opengraph-image.tsx   Per-app OG image
│   │
│   └── api/
│       └── contact/
│           └── route.ts              POST handler only
│
├── components/
│   │
│   ├── layout/
│   │   ├── Nav.tsx                   Fixed nav, scroll-aware opacity/blur
│   │   └── CustomCursor.tsx          Dot + ring cursor (desktop only)
│   │
│   ├── preloader/
│   │   └── Preloader.tsx             Character-by-character logo reveal, exit transition
│   │
│   ├── hero/
│   │   ├── HeroSection.tsx           Full-screen cinematic opening, tagline, scroll hint
│   │   └── ParticleCanvas.tsx        2D canvas particle system, accent-colour aware
│   │
│   ├── showcase/
│   │   ├── AppShowcase.tsx           Renders AppScrollScene for each AppEntry
│   │   ├── AppScrollScene.tsx        GSAP ScrollTrigger pin wrapper for one app
│   │   └── AppScrollCard.tsx         Visual card: icon, name, tagline, screenshot, CTA
│   │
│   ├── detail/
│   │   ├── AppDetailHero.tsx         Name, icon, accent glow, description
│   │   ├── FeatureHighlights.tsx     Animated feature cards (3–5 items)
│   │   ├── ScreenshotCarousel.tsx    Swipeable gallery (Embla Carousel)
│   │   ├── VideoPlayer.tsx           Fullscreen-capable embedded player
│   │   ├── LiveAppCTA.tsx            "Visit Live App" button
│   │   └── BackToPortfolio.tsx       Animated back navigation
│   │
│   ├── contact/
│   │   ├── ContactSection.tsx        Cinematic closing scene wrapper
│   │   ├── ContactForm.tsx           Controlled form → POST /api/contact
│   │   └── SocialLinks.tsx           GitHub, LinkedIn, Twitter/X, email
│   │
│   └── ui/
│       ├── GlowButton.tsx            Reusable CTA button with plasma/ember/aurora variant
│       ├── EyebrowLabel.tsx          Mono uppercase small label with optional dot
│       ├── SectionReveal.tsx         Scroll-triggered reveal wrapper
│       └── VideoModal.tsx            Full-screen video overlay
│
├── lib/
│   │
│   ├── content/
│   │   ├── apps.ts                   AppEntry[] — single source of truth for all app data
│   │   ├── types.ts                  All shared TypeScript interfaces (canonical)
│   │   └── metadata.ts               generateAppMetadata(slug) and generateHomeMetadata()
│   │
│   ├── animation/
│   │   ├── gsap.ts                   GSAP + ScrollTrigger init, scrollReveal(), pinScene()
│   │   ├── particles.ts              ParticleSystem class — spawn, drift, glow, colour-shift
│   │   ├── transitions.ts            Page-enter / page-exit via View Transitions API + GSAP fallback
│   │   └── reducedMotion.ts          prefersReducedMotion() guard, exported boolean hook
│   │
│   ├── db/
│   │   ├── client.ts                 Single Postgres connection pool (DATABASE_URL)
│   │   ├── contact.ts                insertContactSubmission(data): Promise<string> → returns id
│   │   └── schema.sql                DDL — run once, not imported by application code
│   │
│   └── validation/
│       └── contact.ts                Zod schema for ContactFormInput — imported by route.ts and ContactForm.tsx
│
├── public/
│   └── apps/
│       └── [slug]/                   One folder per AppEntry.slug
│           ├── icon.png              512×512, PNG with transparency
│           ├── screenshots/
│           │   ├── 01.webp           First screenshot
│           │   ├── 02.webp
│           │   └── 03.webp           (minimum 3)
│           └── demo.mp4              Optional — only if AppEntry.videoUrl is a local file
│
├── styles/
│   └── globals.css                   Design tokens as CSS custom properties + base reset
│
├── docs/
│   ├── requirements.md
│   ├── features.md
│   ├── stack.md
│   ├── architecture.md
│   ├── design-tokens.json
│   ├── mock.html
│   └── hld.md                        This document
│
├── .env.local                        DATABASE_URL (never committed)
├── .env.example                      DATABASE_URL=                (committed)
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts                (if Tailwind adopted — see §4)
└── package.json
```

---

## 4. Coding Standards

Every builder must follow these rules without exception. Deviations require a note in the PR description.

---

### 4.1 TypeScript

- **Strict mode on.** `tsconfig.json` must include `"strict": true`. No `any` — use `unknown` and narrow, or create a proper type.
- **No type assertions** (`as Foo`) except at verified system boundaries (e.g. parsing JSON from an external URL). Every assertion must have a comment explaining why it is safe.
- **Import types explicitly.** Use `import type { Foo }` for type-only imports.
- **All functions must have explicit return types** when they are exported or async.
- **Enums are banned.** Use `type` union literals instead (e.g. `AccentKey` in §2.2).

---

### 4.2 File & Component Conventions

- **One component per file.** The file name equals the component name in PascalCase. No barrel index files (`index.ts`) inside `components/` subfolders — import by full path.
- **`"use client"` must appear on the first line** of every file that uses hooks, event handlers, browser APIs, or GSAP. It must not appear on files that only export data or types.
- **Server Components are the default.** Only add `"use client"` when there is a concrete reason. Every new component file must be reviewed for whether it truly needs the client directive.
- **Props interfaces** are named `[ComponentName]Props` and defined immediately before the component function in the same file.
- **No inline styles** except for CSS custom properties set dynamically (e.g. `style={{ '--accent': accentColor }}`). All static styles go in `globals.css` or Tailwind classes.

---

### 4.3 Content Layer Rules

- `lib/content/apps.ts` has **zero imports from `components/`**, `app/`, or `lib/animation/`. It imports only from `lib/content/types.ts`.
- `lib/content/types.ts` has **zero imports** from anywhere in the project. It is a leaf module.
- `lib/content/metadata.ts` imports only from `lib/content/apps.ts` and `lib/content/types.ts`.
- Adding a new app = adding one `AppEntry` object to the `apps` array and dropping the asset folder under `public/apps/[slug]/`. No other files change.

---

### 4.4 Animation Layer Rules

- All GSAP usage is **dynamically imported** with `next/dynamic` or inside `useEffect`/`useLayoutEffect`. GSAP must never be imported at the module top level in a file that can be evaluated server-side.
- `lib/animation/` modules export **pure imperative helpers** — no React hooks, no JSX, no state. They receive DOM refs or element references as arguments.
- Every animation helper must call `prefersReducedMotion()` from `lib/animation/reducedMotion.ts` before doing any animation work, and return immediately if it returns `true`.
- `ParticleCanvas.tsx` must be wrapped in `dynamic(() => import(...), { ssr: false })` at its call site.

---

### 4.5 Database Layer Rules

- `lib/db/` modules are **server-only**. They must never be imported in any `"use client"` file or any file inside `components/`.
- `lib/db/client.ts` exports a single connection pool instance. It must not create a new pool on every call.
- All SQL in `lib/db/contact.ts` uses **parameterised queries** — string interpolation into SQL is forbidden without exception.
- `schema.sql` is documentation/migration source only — it is never `require`d or `import`ed by application code.

---

### 4.6 API Route Rules

- `app/api/contact/route.ts` exports only `POST`. Any other HTTP method returns `405` immediately without any business logic.
- The route handler validates with the shared Zod schema from `lib/validation/contact.ts` **before** touching the DB.
- The route handler must never return stack traces or internal error messages in the response body. Log with `console.error`, return generic error codes.
- The honeypot field `_hp` is checked first, before Zod validation. If non-empty → return early with `200 { ok: true }`.

---

### 4.7 Asset Conventions

- All app icons: `public/apps/[slug]/icon.png` — **512×512 PNG**, transparent background.
- All screenshots: `public/apps/[slug]/screenshots/` — **WebP format**, named `01.webp`, `02.webp`, etc. (zero-padded two digits). Minimum 3 per app.
- Demo video (if local): `public/apps/[slug]/demo.mp4` — H.264, max 50 MB. Prefer a hosted URL (YouTube embed) over a local file.
- The `src` field in `Screenshot` objects must be an absolute path from the public root: `/apps/[slug]/screenshots/01.webp`. No relative paths.

---

### 4.8 Routing & Navigation

- `app/apps/[slug]/page.tsx` must implement `generateStaticParams` that returns every slug from `apps` in `lib/content/apps.ts`. No slug is allowed to fall through to dynamic rendering.
- Navigation from a detail page back to the home page uses `router.back()` as the primary mechanism. If there is no history entry (direct navigation to `/apps/[slug]`), fall back to `router.push('/')`.
- All external links (`liveUrl`, social links) use `target="_blank" rel="noopener noreferrer"` without exception.

---

### 4.9 SEO & Metadata

- Every route that exports a `page.tsx` must also have a corresponding `generateMetadata` export or a static `metadata` export.
- `lib/content/metadata.ts` is the only place that constructs `Metadata` objects. Page files call it — they do not build metadata inline.
- Open Graph `og:image` for each app detail page is generated by `app/apps/[slug]/opengraph-image.tsx` using Next.js ImageResponse.
- The `<html>` element in `app/layout.tsx` must have `lang="en"`.

---

### 4.10 Environment & Secrets

- `DATABASE_URL` is the only secret in V1.
- It must be accessed exclusively via `process.env.DATABASE_URL` inside `lib/db/client.ts`. No other file reads environment variables directly.
- `.env.local` is in `.gitignore`. `.env.example` is committed with an empty value: `DATABASE_URL=`.
- A missing `DATABASE_URL` at startup of `lib/db/client.ts` must throw immediately with a descriptive error: `"Missing required environment variable: DATABASE_URL"`.

---

### 4.11 Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| React components | PascalCase file + export | `AppScrollCard.tsx` |
| Hooks | camelCase, `use` prefix | `useScrollProgress` |
| Helper functions | camelCase | `insertContactSubmission` |
| CSS custom properties | `--kebab-case` | `--color-plasma` |
| App slugs | kebab-case, no numbers at start | `orbit-tracker` |
| Postgres columns | `snake_case` | `created_at` |
| TypeScript interfaces | PascalCase | `AppEntry` |
| TypeScript type aliases | PascalCase | `AccentKey` |
| Constants | SCREAMING_SNAKE only for true constants | `MAX_MESSAGE_LENGTH` |

---

### 4.12 Performance Rules

- Images served through `next/image` everywhere except inside `opengraph-image.tsx`. No raw `<img>` tags in components.
- `next/image` usage must always supply `width` and `height` (from the `Screenshot` interface) or `fill` with a sized parent. No layout shift.
- GSAP and the particle canvas must not block the main thread during initial paint. Both are deferred via dynamic import or `useLayoutEffect`.
- No third-party analytics, fonts, or scripts are loaded synchronously in `<head>`. Font loading uses Next.js `next/font` with `display: 'swap'`.

---

### 4.13 Accessibility

- Every `<img>` and `next/image` must have a non-empty `alt` attribute. Decorative images use `alt=""` and `role="presentation"`.
- Interactive elements must be reachable by keyboard. Custom elements that behave as buttons use `<button>`. No `div` with `onClick` without `role="button"` and `onKeyDown`.
- `prefersReducedMotion()` is checked before every GSAP animation. When `true`, skip animations — content must still be fully visible and readable without motion.
- Color contrast for body text (`--t1` on `--void`) is ≥ 7:1. Secondary text (`--t2` on `--surface`) is ≥ 4.5:1. These must not be broken by any new color choices.

---

*Document Version: 1.0*
*Prepared by: Hugo — Tech Lead @ ShipForge*
*Downstream: Nova (deployment), dev team (implementation)*
