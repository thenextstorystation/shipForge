# TheDeveloper — Implementation Walkthrough
*Ada, Build Engineer @ ShipForge*

---

## Overview

This walkthrough covers Sprints 1–4 of the build plan: foundation scaffolding, animation engine, hero/preloader, and the app showcase scroll journey. Follow the steps in order — each sprint builds on the last. Where the plan references an exact file path, that path is canonical; do not invent alternatives.

---

## Prerequisites

Before writing a single line of code, confirm:

- Node.js 20.x installed (`node --version`)
- pnpm 9.x installed (`pnpm --version`)
- A Neon or Supabase Postgres instance provisioned with the `DATABASE_URL` connection string in hand
- A Vercel project created and linked to the repo (Nova handles deployment; you need the project slug for env var setup)
- Git repo initialised, `main` branch protected (PRs required)

---

## Sprint 1 — Foundation

### S1-01 · Repo & project scaffold

```bash
npx create-next-app@14 thedeveloper \
  --typescript \
  --app \
  --no-tailwind \
  --no-src-dir \
  --import-alias "@/*"
cd thedeveloper
```

Open `tsconfig.json`. Verify `"strict": true` is present under `compilerOptions`. Add path aliases if the scaffold did not add them:

```jsonc
// tsconfig.json (compilerOptions additions)
"paths": {
  "@/components/*": ["./components/*"],
  "@/lib/*":        ["./lib/*"],
  "@/styles/*":     ["./styles/*"]
}
```

Create `.env.example` at the project root:

```
DATABASE_URL=
```

Add to `.gitignore` (the scaffold usually includes these, but confirm):

```
.env.local
.next/
node_modules/
```

Create a Vercel project via the dashboard, link the repo, and add `DATABASE_URL` as a project environment variable (Production + Preview + Development). Do not commit `.env.local`.

Run `pnpm dev` — the default Next.js page should return 200.

---

### S1-02 · Install & pin core dependencies

```bash
pnpm add gsap@3.12.5 embla-carousel-react@8.1.7 zod@3.23.8 @vercel/postgres@0.10.0
```

Pin exact versions — no `^` prefix. After install, open `package.json` and manually strip any carets that pnpm may have added. Run `pnpm audit` and address any critical findings before continuing.

---

### S1-03 · Design tokens → globals.css

Create `styles/globals.css`. This file is the single source of all design tokens as CSS custom properties. Translate every value from `docs/design-tokens.json` exactly. Structure:

```css
/* styles/globals.css */

/* ── Reset ─────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Root tokens ────────────────────────────────── */
:root {
  /* Background */
  --void:        #020204;
  --deep:        #07070E;
  --surface:     #0D0D18;
  --elevated:    #121220;
  --glass:       rgba(255,255,255,0.025);
  --glass-s:     rgba(255,255,255,0.055);

  /* Accent — plasma */
  --plasma:         #7B4FFF;
  --plasma-dim:     #5C35CC;
  --plasma-b:       #9B6FFF;
  --plasma-glow:    rgba(123,79,255,0.28);
  --plasma-soft:    rgba(123,79,255,0.12);

  /* Accent — ember */
  --ember:          #FF5C35;
  --ember-dim:      #CC3D20;
  --ember-b:        #FF7A5C;
  --ember-glow:     rgba(255,92,53,0.22);
  --ember-soft:     rgba(255,92,53,0.10);

  /* Accent — aurora */
  --aurora:         #35FFD4;
  --aurora-dim:     #20BFA0;
  --aurora-b:       #6EFFDF;
  --aurora-glow:    rgba(53,255,212,0.18);
  --aurora-soft:    rgba(53,255,212,0.08);

  /* Accent — gold */
  --gold:           #E8C97A;
  --gold-dim:       #B89A4A;
  --gold-glow:      rgba(232,201,122,0.20);

  /* Text */
  --t1:       #F0EEF8;
  --t2:       #9B98B8;
  --t3:       #6B6888;
  --tm:       #3E3C58;
  --t-plasma: #A07EFF;
  --t-ember:  #FF7A5C;
  --t-aurora: #6EFFDF;
  --t-gold:   #E8C97A;

  /* Borders */
  --b-hair:     rgba(255,255,255,0.04);
  --b-sub:      rgba(255,255,255,0.07);
  --b-def:      rgba(255,255,255,0.11);
  --b-str:      rgba(255,255,255,0.20);
  --b-plasma:   rgba(123,79,255,0.38);
  --b-plasma-s: rgba(123,79,255,0.18);
  --b-ember:    rgba(255,92,53,0.32);
  --b-aurora:   rgba(53,255,212,0.28);
  --b-gold:     rgba(232,201,122,0.30);

  /* Gradients (reference values — use in className or style props) */
  --grad-brand:          linear-gradient(90deg, #A07EFF 0%, #FF7A5C 52%, #6EFFDF 100%);
  --grad-brand-diagonal: linear-gradient(135deg, #7B4FFF 0%, #FF5C35 60%, #35FFD4 100%);
  --grad-overlay-bottom: linear-gradient(0deg, #020204 0%, transparent 100%);
  --grad-overlay-top:    linear-gradient(180deg, #020204 0%, transparent 100%);

  /* App-accent radials */
  --grad-app-plasma: radial-gradient(ellipse at 50% 0%, rgba(123,79,255,0.30) 0%, transparent 70%);
  --grad-app-ember:  radial-gradient(ellipse at 50% 0%, rgba(255,92,53,0.28)  0%, transparent 70%);
  --grad-app-aurora: radial-gradient(ellipse at 50% 0%, rgba(53,255,212,0.22) 0%, transparent 70%);
  --grad-app-gold:   radial-gradient(ellipse at 50% 0%, rgba(232,201,122,0.25) 0%, transparent 70%);

  /* Typography */
  --ff-display: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --ff-body:    system-ui, -apple-system, 'Segoe UI', sans-serif;
  --ff-mono:    'Courier New', Courier, monospace;

  /* Radius */
  --r-xs:      4px;
  --r-sm:      8px;
  --r-md:      12px;
  --r-lg:      16px;
  --r-xl:      24px;
  --r-2xl:     32px;
  --r-card:    20px;
  --r-card-lg: 28px;
  --r-icon:    18px;
  --r-icon-sm: 14px;
  --r-icon-lg: 26px;
  --r-icon-xl: 32px;
  --r-pill:    9999px;

  /* Spacing */
  --nav-h:  72px;
  --pad-x:  clamp(20px, 5vw, 80px);

  /* Easing */
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-cinema:   cubic-bezier(0.22, 1, 0.36, 1);
  --ease-standard: cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── Base ──────────────────────────────────────── */
html {
  scroll-behavior: smooth;
  font-size: 16px;
}

body {
  background: var(--void);
  color: var(--t1);
  font-family: var(--ff-body);
  line-height: 1.6;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a  { text-decoration: none; color: inherit; }
button { border: none; background: none; font: inherit; color: inherit; cursor: pointer; }
img { display: block; max-width: 100%; }

/* ── Scrollbar ─────────────────────────────────── */
::-webkit-scrollbar       { width: 3px; }
::-webkit-scrollbar-track { background: var(--void); }
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--plasma), var(--ember));
  border-radius: var(--r-pill);
}

/* ── Background scene elements ─────────────────── */
/* (Orb animations, grid, mesh — ported from mock.html) */
.bg-scene {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.bg-mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 10%,  rgba(123,79,255,0.18) 0%, transparent 55%),
    radial-gradient(ellipse 60% 50% at 85% 25%,  rgba(255,92,53,0.12)  0%, transparent 50%),
    radial-gradient(ellipse 70% 55% at 55% 80%,  rgba(53,255,212,0.09) 0%, transparent 50%),
    radial-gradient(ellipse 50% 40% at 10% 75%,  rgba(232,201,122,0.07) 0%, transparent 45%),
    var(--void);
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(72px);
  will-change: transform;
}
/* Orb sizes, positions, and animation keyframes from mock.html verbatim */
.orb-1 {
  width: 680px; height: 680px;
  background: radial-gradient(circle, rgba(123,79,255,0.55) 0%, transparent 70%);
  top: -200px; left: -150px;
  animation: orbDrift1 24s ease-in-out infinite alternate;
}
.orb-2 {
  width: 520px; height: 520px;
  background: radial-gradient(circle, rgba(255,92,53,0.45) 0%, transparent 70%);
  top: 15%; right: -120px;
  animation: orbDrift2 19s ease-in-out infinite alternate;
}
.orb-3 {
  width: 480px; height: 480px;
  background: radial-gradient(circle, rgba(53,255,212,0.30) 0%, transparent 70%);
  bottom: 10%; left: 20%;
  animation: orbDrift3 27s ease-in-out infinite alternate;
}
.orb-4 {
  width: 360px; height: 360px;
  background: radial-gradient(circle, rgba(232,201,122,0.25) 0%, transparent 70%);
  bottom: 0; right: 10%;
  animation: orbDrift4 21s ease-in-out infinite alternate;
}
.orb-5 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(123,79,255,0.35) 0%, transparent 70%);
  top: 50%; left: 48%;
  animation: orbDrift1 31s ease-in-out infinite alternate;
  animation-delay: -8s;
}

@keyframes orbDrift1 {
  0%   { transform: translate(0,0) scale(1); }
  40%  { transform: translate(60px,-40px) scale(1.08); }
  75%  { transform: translate(-30px,55px) scale(0.94); }
  100% { transform: translate(35px,20px) scale(1.04); }
}
@keyframes orbDrift2 {
  0%   { transform: translate(0,0) scale(1); }
  35%  { transform: translate(-50px,35px) scale(1.06); }
  70%  { transform: translate(45px,-50px) scale(0.92); }
  100% { transform: translate(-20px,15px) scale(1.02); }
}
@keyframes orbDrift3 {
  0%   { transform: translate(0,0) scale(1); }
  50%  { transform: translate(40px,-60px) scale(1.10); }
  100% { transform: translate(-55px,30px) scale(0.96); }
}
@keyframes orbDrift4 {
  0%   { transform: translate(0,0) scale(1); }
  45%  { transform: translate(-35px,-25px) scale(1.05); }
  100% { transform: translate(50px,40px) scale(0.97); }
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
}
.bg-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(2,2,4,0.75) 100%);
}

/* ── Page wrapper ───────────────────────────────── */
.page {
  position: relative;
  z-index: 1;
}

/* Reduced motion overrides */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Import this file in `app/layout.tsx` (see S1-10 below).

---

### S1-04 · TypeScript canonical types

Create `lib/content/types.ts`. This file must have **zero import statements**:

```typescript
// lib/content/types.ts
// Leaf module — no imports from anywhere in the project.

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
  icon:        string;
  title:       string;
  description: string;
}

export interface Screenshot {
  src:    string;
  alt:    string;
  width:  number;
  height: number;
}

export interface AppEntry {
  slug:            string;
  name:            string;
  tagline:         string;
  description:     string;
  icon:            string;
  accentKey:       AccentKey;
  category:        AppCategory;
  year:            number;
  features:        Feature[];
  screenshots:     Screenshot[];
  videoUrl:        string | null;
  liveUrl:         string;
  coverScreenshot: number;
}

export interface ContactFormInput {
  name:    string;
  email:   string;
  message: string;
}

export interface ContactSubmission extends ContactFormInput {
  id:         string;
  created_at: string;
}

export interface ContactApiSuccess {
  ok: true;
  id: string;
}

export interface ContactApiError {
  ok:      false;
  error:   'VALIDATION_ERROR' | 'METHOD_NOT_ALLOWED' | 'INTERNAL_ERROR';
  fields?: Partial<Record<keyof ContactFormInput, string>>;
}

export type ContactApiResponse = ContactApiSuccess | ContactApiError;
```

Run `pnpm tsc --noEmit` — zero errors expected.

---

### S1-05 · Content layer — apps.ts scaffold

Create `lib/content/apps.ts`:

```typescript
// lib/content/apps.ts
import type { AppEntry } from './types';

export const apps: AppEntry[] = [
  {
    slug:            'placeholder-one',
    name:            'Placeholder One',
    tagline:         'A cinematic placeholder showcasing the plasma accent palette.',
    description:     'This is a placeholder application entry used during development. It demonstrates the full AppEntry shape including all required fields. Replace with real app data before launch.',
    icon:            '/apps/placeholder-one/icon.png',
    accentKey:       'plasma',
    category:        'Web App',
    year:            2024,
    features: [
      { icon: '⚡', title: 'Blazing Fast',   description: 'Sub-100ms response times with edge-cached static assets.' },
      { icon: '🎨', title: 'Pixel Perfect',  description: 'Every detail crafted to sub-pixel precision across all screens.' },
      { icon: '🔐', title: 'Secure by Default', description: 'End-to-end encryption with zero plaintext data at rest.' },
    ],
    screenshots: [
      { src: '/apps/placeholder-one/screenshots/01.webp', alt: 'Placeholder One — main dashboard',    width: 1280, height: 800 },
      { src: '/apps/placeholder-one/screenshots/02.webp', alt: 'Placeholder One — feature view',      width: 1280, height: 800 },
      { src: '/apps/placeholder-one/screenshots/03.webp', alt: 'Placeholder One — settings screen',   width: 1280, height: 800 },
    ],
    videoUrl:        null,
    liveUrl:         'https://example.com',
    coverScreenshot: 0,
  },
  {
    slug:            'placeholder-two',
    name:            'Placeholder Two',
    tagline:         'Ember-accented placeholder demonstrating mobile category.',
    description:     'Second placeholder entry. Uses the ember accent key and a mobile category to verify visual variety rules are respected across consecutive entries.',
    icon:            '/apps/placeholder-two/icon.png',
    accentKey:       'ember',
    category:        'Mobile — iOS',
    year:            2023,
    features: [
      { icon: '📱', title: 'Native Feel',    description: 'Gesture-driven interactions that feel completely native.' },
      { icon: '🌐', title: 'Offline First',  description: 'Full functionality with zero network connectivity required.' },
      { icon: '📊', title: 'Rich Analytics', description: 'Actionable insights surfaced directly in the app.' },
    ],
    screenshots: [
      { src: '/apps/placeholder-two/screenshots/01.webp', alt: 'Placeholder Two — onboarding',    width: 1280, height: 800 },
      { src: '/apps/placeholder-two/screenshots/02.webp', alt: 'Placeholder Two — main view',     width: 1280, height: 800 },
      { src: '/apps/placeholder-two/screenshots/03.webp', alt: 'Placeholder Two — detail screen', width: 1280, height: 800 },
    ],
    videoUrl:        null,
    liveUrl:         'https://example.com',
    coverScreenshot: 0,
  },
  {
    slug:            'placeholder-three',
    name:            'Placeholder Three',
    tagline:         'Aurora-accented placeholder rounding out the dev dataset.',
    description:     'Third placeholder demonstrating the aurora accent and a different application category. Sufficient for testing all three scroll scenes during Sprint 4 development.',
    icon:            '/apps/placeholder-three/icon.png',
    accentKey:       'aurora',
    category:        'Chrome Extension',
    year:            2024,
    features: [
      { icon: '🔌', title: 'One-Click Install', description: 'Up and running in seconds from the Chrome Web Store.' },
      { icon: '🧩', title: 'Modular',           description: 'Enable only the features you need — nothing else loads.' },
      { icon: '🎯', title: 'Contextual',         description: 'Activates only on the pages where it adds value.' },
    ],
    screenshots: [
      { src: '/apps/placeholder-three/screenshots/01.webp', alt: 'Placeholder Three — popup',      width: 1280, height: 800 },
      { src: '/apps/placeholder-three/screenshots/02.webp', alt: 'Placeholder Three — options page', width: 1280, height: 800 },
      { src: '/apps/placeholder-three/screenshots/03.webp', alt: 'Placeholder Three — in action',   width: 1280, height: 800 },
    ],
    videoUrl:        null,
    liveUrl:         'https://example.com',
    coverScreenshot: 0,
  },
];
```

Run `pnpm tsc --noEmit`. Zero errors.

---

### S1-06 · Placeholder public assets

Create the following directory tree under `public/`:

```
public/
└── apps/
    ├── placeholder-one/
    │   ├── icon.png
    │   └── screenshots/
    │       ├── 01.webp
    │       ├── 02.webp
    │       └── 03.webp
    ├── placeholder-two/
    │   └── ... (same structure)
    └── placeholder-three/
        └── ... (same structure)
```

For the placeholder icons: generate 512×512 PNG files using any image editor or a small Node script. Each should be a solid accent-colored square (`#7B4FFF`, `#FF5C35`, `#35FFD4` respectively) with the text "APP" centered in white. For screenshots: 1280×800 WebP files — a dark gradient background with the app name text is sufficient.

A quick generation approach using ImageMagick (if available):

```bash
# Example for placeholder-one icon
convert -size 512x512 xc:'#7B4FFF' \
  -font Helvetica -pointsize 80 -fill white -gravity center -annotate 0 "APP" \
  public/apps/placeholder-one/icon.png
```

Repeat for all three slugs with their respective colors. Verify:

```bash
curl http://localhost:3000/apps/placeholder-one/icon.png
# → 200 with image/png content-type
```

---

### S1-07 · Database schema + migration

Create `lib/db/schema.sql`:

```sql
-- lib/db/schema.sql
-- Run once against the provisioned Postgres instance.
-- Never imported by application code.

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

Run the migration once:

```bash
# Using psql with your connection string
psql "$DATABASE_URL" -f lib/db/schema.sql
```

Document this command in `README.md` under a "Database setup" section.

Create `lib/db/client.ts`:

```typescript
// lib/db/client.ts
// Server-only. Never import this in a "use client" file or component.
import { sql } from '@vercel/postgres';

// Validate at module load time — fail loudly rather than silently at query time.
if (!process.env.DATABASE_URL) {
  throw new Error('Missing required environment variable: DATABASE_URL');
}

// @vercel/postgres reads DATABASE_URL from the environment automatically.
// Re-export sql as the single query interface for the application.
export { sql };
```

Create `lib/db/contact.ts`:

```typescript
// lib/db/contact.ts
// Server-only. Parameterised queries only — no string interpolation.
import type { ContactFormInput } from '@/lib/content/types';
import { sql } from './client';

export async function insertContactSubmission(
  data: ContactFormInput,
): Promise<string> {
  const result = await sql<{ id: string }>`
    INSERT INTO contact_submissions (name, email, message)
    VALUES (${data.name}, ${data.email}, ${data.message})
    RETURNING id
  `;

  const row = result.rows[0];
  if (!row) {
    throw new Error('INSERT returned no rows');
  }
  return row.id;
}
```

The `sql` template literal from `@vercel/postgres` is parameterised — the values are passed as bound parameters, never interpolated into the query string. This is the correct pattern.

---

### S1-08 · Zod validation schema

Create `lib/validation/contact.ts`:

```typescript
// lib/validation/contact.ts
import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1,   { message: 'Name is required' })
    .max(100, { message: 'Name must be 100 characters or fewer' }),

  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .min(6,   { message: 'Email is required' })
    .max(254, { message: 'Email address is too long' }),

  message: z
    .string()
    .trim()
    .min(1,    { message: 'Message is required' })
    .max(2000, { message: 'Message must be 2000 characters or fewer' }),

  // Honeypot field — present in form, must be empty for real submissions.
  // Validated in route handler before this schema runs; included here for type completeness.
  _hp: z.string().optional(),
});

export type ContactSchemaInput = z.infer<typeof contactSchema>;
```

---

### S1-09 · POST /api/contact route handler

Create `app/api/contact/route.ts`:

```typescript
// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validation/contact';
import { insertContactSubmission } from '@/lib/db/contact';
import type { ContactApiResponse } from '@/lib/content/types';

export async function POST(request: NextRequest): Promise<NextResponse<ContactApiResponse>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'VALIDATION_ERROR', fields: {} },
      { status: 400 },
    );
  }

  // Honeypot check — silent success, no DB write.
  if (
    body !== null &&
    typeof body === 'object' &&
    '_hp' in body &&
    (body as Record<string, unknown>)['_hp'] !== ''
  ) {
    return NextResponse.json({ ok: true, id: 'bot' }, { status: 200 });
  }

  // Zod validation.
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Partial<Record<'name' | 'email' | 'message', string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as 'name' | 'email' | 'message';
      if (key && !fields[key]) {
        fields[key] = issue.message;
      }
    }
    return NextResponse.json(
      { ok: false, error: 'VALIDATION_ERROR', fields },
      { status: 400 },
    );
  }

  // DB write.
  try {
    const { name, email, message } = parsed.data;
    const id = await insertContactSubmission({ name, email, message });
    return NextResponse.json({ ok: true, id }, { status: 200 });
  } catch (err) {
    console.error('[/api/contact] DB insert failed:', err);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

// All other methods — 405.
export async function GET(): Promise<NextResponse<ContactApiResponse>> {
  return NextResponse.json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, { status: 405 });
}
```

Note: we export a named `GET` that returns 405 rather than relying on Next.js default method-not-allowed behaviour, because the HLD requires an explicit 405 response.

Manual verification steps (Quill should confirm these):
- `curl -X POST http://localhost:3000/api/contact -H 'Content-Type: application/json' -d '{"name":"Test","email":"t@example.com","message":"Hello world"}'` → `{"ok":true,"id":"<uuid>"}`
- `curl -X GET http://localhost:3000/api/contact` → 405
- `curl -X POST ... -d '{"name":"","email":"bad","message":""}'` → 400 with `fields`
- `curl -X POST ... -d '{"name":"Bot","email":"b@b.com","message":"Spam","_hp":"filled"}'` → 200 `{"ok":true,"id":"bot"}` — no row in DB
- Check `contact_submissions` table directly for the row from the first test

---

### S1-10 · Root layout
