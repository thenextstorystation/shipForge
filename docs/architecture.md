# TheDeveloper — Solution Architecture
*Prepared by Atlas, Architect @ ShipForge*

---

## 1. Solution Overview

TheDeveloper is a **statically-rendered, content-driven portfolio site** built on Next.js 14 App Router. The majority of the experience lives in a single long-scroll page (`/`) rendered at build time. Each app detail page (`/apps/[slug]`) is also statically generated from a typed content layer. There is no user-facing authentication. The one runtime surface is the contact form, which hits a thin Next.js Route Handler that persists the submission to Postgres (Neon/Supabase) and optionally forwards it by email.

The animation engine (GSAP ScrollTrigger + canvas particles) runs entirely in the browser. The server is responsible only for delivering optimised HTML, assets, and accepting form POST requests. This split keeps the architecture simple while enabling the full cinematic experience.

---

## 2. Main Components & Responsibilities

### 2.1 Content Layer — `lib/content/`

| Module | Responsibility |
|---|---|
| `apps.ts` | Single source of truth: typed `AppEntry[]` array. Each entry carries slug, name, icon path, short description, full description, features, screenshot URLs, video URL, live URL, category, accent colour key. |
| `types.ts` | Shared TypeScript interfaces (`AppEntry`, `Feature`, `Screenshot`, `ContactSubmission`). |
| `metadata.ts` | Generates Next.js `Metadata` objects (title, description, Open Graph, Twitter Card) for every route. |

No database read is needed for content. Apps are hardcoded for V1 per requirements. Adding an app = adding an object to the array.

---

### 2.2 Route Layer — `app/`

| Route | Type | Responsibility |
|---|---|---|
| `app/page.tsx` | Static page | Assembles the full scroll journey: Preloader → Hero → App Showcase (all app cards) → Contact. Passes `AppEntry[]` as props to child components. |
| `app/apps/[slug]/page.tsx` | Static page (ISR-ready) | Detail page for one app. `generateStaticParams` pre-renders all slugs at build time. |
| `app/api/contact/route.ts` | Route Handler (POST) | Validates form body, writes `ContactSubmission` row to Postgres, returns JSON `{ok: true}` or error. |
| `app/layout.tsx` | Root layout | Injects fonts (Syne, Inter, JetBrains Mono), global CSS tokens, `<head>` defaults, cursor elements, background canvas element. |
| `app/not-found.tsx` | Static page | Branded 404 in theme. |

---

### 2.3 UI Component Tree — `components/`

```
components/
├── layout/
│   ├── Nav.tsx                 Fixed nav, scroll-aware opacity/blur
│   └── CustomCursor.tsx        Dot + ring cursor, pointer-event tracking
│
├── preloader/
│   └── Preloader.tsx           Logo char animation, progress bar, exit transition
│
├── hero/
│   ├── HeroSection.tsx         Full-screen cinematic opening, tagline, scroll hint
│   └── ParticleCanvas.tsx      WebGL/canvas fluid organic particle system
│
├── showcase/
│   ├── AppShowcase.tsx         Orchestrates the full scroll journey across all apps
│   ├── AppScrollScene.tsx      One full-screen scroll moment per app (GSAP ScrollTrigger)
│   └── AppScrollCard.tsx       Visual card: icon, name, short description, screenshot, CTA
│
├── detail/
│   ├── AppDetailHero.tsx       App name, icon, accent glow, full description
│   ├── FeatureHighlights.tsx   Animated feature cards
│   ├── ScreenshotCarousel.tsx  Swipeable image gallery (Embla or Swiper)
│   ├── VideoPlayer.tsx         Fullscreen-capable embedded video player
│   ├── LiveAppCTA.tsx          "Visit Live App" prominent button
│   └── BackToPortfolio.tsx     Smooth return navigation with animated transition
│
├── contact/
│   ├── ContactSection.tsx      Cinematic closing scene wrapper
│   ├── ContactForm.tsx         Controlled form → POST /api/contact
│   └── SocialLinks.tsx         GitHub, LinkedIn, Twitter/X icons + email
│
└── ui/
    ├── GlowButton.tsx          Reusable plasma/ember/aurora glow CTA button
    ├── EyebrowLabel.tsx        Mono uppercase small label
    ├── SectionReveal.tsx       Scroll-triggered reveal wrapper (GSAP or Intersection Observer)
    └── VideoModal.tsx          Full-screen video overlay (optional)
```

---

### 2.4 Animation Layer — `lib/animation/`

| Module | Responsibility |
|---|---|
| `gsap.ts` | Initialises GSAP + ScrollTrigger, exports `scrollReveal()` and `pinScene()` helpers. Client-side only (dynamic import guarded). |
| `particles.ts` | Canvas particle system class: spawn, drift, glow, colour-shift per active app accent. |
| `transitions.ts` | Page-enter / page-exit view transition helpers (CSS View Transitions API with GSAP fallback). |
| `reducedMotion.ts` | `prefersReducedMotion()` guard — disables scroll animations and canvas when true. |

---

### 2.5 Data Layer — `lib/db/`

| Module | Responsibility |
|---|---|
| `client.ts` | Neon/Supabase Postgres client (using `@vercel/postgres` or `postgres` npm package). Single connection pool. |
| `contact.ts` | `insertContactSubmission(data)` — parameterised INSERT into `contact_submissions` table. |
| `schema.sql` | DDL for `contact_submissions` table (id, name, email, message, created_at). Run once via migration. |

---

### 2.6 Infrastructure

| Concern | Solution |
|---|---|
| Hosting & CDN | Vercel — static pages served from edge, Route Handlers run as serverless functions |
| Database | Postgres via `DATABASE_URL` env var (Neon or Supabase, already provisioned) |
| Static assets | Images and video assets stored in `public/apps/[slug]/` — served via Vercel CDN |
| Environment secrets | `DATABASE_URL` in Vercel project settings |
| SEO | Next.js `generateMetadata()` per route, Open Graph image via `opengraph-image.tsx` convention |

---

## 3. Data Flow

### 3.1 Page Load & Scroll Experience

```
Browser requests /
  → Vercel Edge CDN returns pre-rendered HTML (static)
  → Browser parses HTML, loads JS bundle
  → layout.tsx mounts: fonts, global CSS, CustomCursor, ParticleCanvas
  → Preloader.tsx mounts, runs char animation → fires exit after 2.8s
  → HeroSection animates in (GSAP timeline)
  → GSAP ScrollTrigger registers pin scenes for each AppScrollScene
  → User scrolls → ScrollTrigger fires per-app reveal animations
  → Particle system shifts accent colour to match active app
  → User clicks "See Full Story" CTA on AppScrollCard
```

### 3.2 App Detail Page

```
Browser requests /apps/[slug]
  → Vercel Edge CDN returns pre-rendered static HTML (generated at build via generateStaticParams)
  → AppDetailHero, FeatureHighlights, ScreenshotCarousel, VideoPlayer mount
  → GSAP runs entrance animations
  → User clicks "Visit Live App" → external navigation (new tab)
  → User clicks "Back" → router.back() with View Transition
```

### 3.3 Contact Form Submission

```
User fills ContactForm → clicks Send
  → Client-side validation (zod or native HTML5)
  → fetch POST /api/contact  { name, email, message }
    → Route Handler validates body (zod schema)
    → lib/db/contact.ts INSERT into contact_submissions
    → Returns { ok: true }
  → ContactForm shows success state animation
```

---

## 4. Key Boundaries

| Boundary | Rule |
|---|---|
| **Server / Client** | All animation code is `"use client"`. Content array and metadata generation are pure server modules. Route Handler is server-only. |
| **Static / Dynamic** | `/` and `/apps/[slug]` are fully static. Only `/api/contact` is dynamic (serverless function). |
| **Content / UI** | `lib/content/apps.ts` has zero UI imports. Components import from content layer, never the reverse. |
| **Animation / Logic** | `lib/animation/` modules have no business logic. They export pure imperative helpers that components call. |
| **DB access** | Only `app/api/contact/route.ts` touches the DB. No page or component queries Postgres directly. |

---

## 5. File & Folder Structure (Top-Level)

```
thedeveloper/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── not-found.tsx
│   ├── opengraph-image.tsx
│   ├── apps/
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       └── opengraph-image.tsx
│   └── api/
│       └── contact/
│           └── route.ts
├── components/           (see §2.3)
├── lib/
│   ├── content/
│   │   ├── apps.ts
│   │   ├── types.ts
│   │   └── metadata.ts
│   ├── animation/
│   │   ├── gsap.ts
│   │   ├── particles.ts
│   │   ├── transitions.ts
│   │   └── reducedMotion.ts
│   └── db/
│       ├── client.ts
│       ├── contact.ts
│       └── schema.sql
├── public/
│   └── apps/
│       └── [slug]/
│           ├── icon.png
│           ├── screenshots/
│           └── demo.mp4
├── styles/
│   └── globals.css        (design tokens as CSS custom properties)
├── docs/
└── next.config.ts
```

---

## 6. Mermaid Architecture Diagram

```mermaid
flowchart TD
    subgraph Browser["Browser (Client)"]
        direction TB
        PL["Preloader\nchar animation"]
        HE["HeroSection\n+ ParticleCanvas"]
        SC["AppShowcase\nScroll Scenes ×N"]
        DP["App Detail Page\n/apps/[slug]"]
        CF["ContactForm"]
        CUR["CustomCursor"]
        GSAP["lib/animation/\ngsap · particles · transitions"]

        PL --> HE --> SC
        SC -->|CTA click| DP
        DP -->|Back| SC
        SC --> CF
        GSAP -.drives.-> HE
        GSAP -.drives.-> SC
        GSAP -.drives.-> DP
        CUR -.overlays.-> HE
    end

    subgraph NextServer["Next.js App Router (Vercel)"]
        direction TB
        ROOT["app/page.tsx\nStatic — SSG"]
        DETAIL["app/apps/[slug]/page.tsx\nStatic — generateStaticParams"]
        CONTACT_API["app/api/contact/\nroute.ts\nServerless POST handler"]
        LAYOUT["app/layout.tsx\nFonts · CSS tokens · Shell"]
    end

    subgraph ContentLayer["lib/content/ (build-time)"]
        APPS["apps.ts\nAppEntry[ ]"]
        TYPES["types.ts"]
        META["metadata.ts\nOpen Graph · SEO"]
    end

    subgraph DBLayer["lib/db/ (server-only)"]
        DBCLIENT["client.ts\nPostgres pool"]
        DBCONTACT["contact.ts\ninsertContactSubmission()"]
        SCHEMA["schema.sql\ncontact_submissions"]
    end

    subgraph Infra["Infrastructure"]
        VERCEL["Vercel Edge CDN\nStatic HTML · Assets"]
        POSTGRES["Postgres\nNeon / Supabase"]
        PUBLICASSETS["public/apps/[slug]/\nicons · screenshots · video"]
    end

    %% Build-time flow
    APPS -->|AppEntry[]| ROOT
    APPS -->|AppEntry[]| DETAIL
    META -->|Metadata| ROOT
    META -->|Metadata| DETAIL
    TYPES --> APPS

    %% Serve flow
    LAYOUT --> ROOT
    LAYOUT --> DETAIL
    ROOT -->|pre-rendered HTML| VERCEL
    DETAIL -->|pre-rendered HTML| VERCEL
    PUBLICASSETS -->|CDN| VERCEL

    %% Runtime browser flow
    VERCEL -->|HTML + JS| Browser
    Browser -->|fetch POST /api/contact| CONTACT_API

    %% DB flow
    CONTACT_API --> DBCONTACT
    DBCONTACT --> DBCLIENT
    DBCLIENT -->|DATABASE_URL| POSTGRES
    SCHEMA -.defines.-> POSTGRES

    %% Styling
    classDef client fill:#121220,stroke:#7B4FFF,color:#F0EEF8
    classDef server fill:#0D0D18,stroke:#35FFD4,color:#F0EEF8
    classDef content fill:#07070E,stroke:#E8C97A,color:#F0EEF8
    classDef db fill:#07070E,stroke:#FF5C35,color:#F0EEF8
    classDef infra fill:#020204,stroke:#9B98B8,color:#9B98B8

    class PL,HE,SC,DP,CF,CUR,GSAP client
    class ROOT,DETAIL,CONTACT_API,LAYOUT server
    class APPS,TYPES,META content
    class DBCLIENT,DBCONTACT,SCHEMA db
    class VERCEL,POSTGRES,PUBLICASSETS infra
```

---

## 7. Critical Architecture Decisions

| Decision | Rationale |
|---|---|
| **Static generation for all pages** | Eliminates server latency on the critical path. Cinematic first impression requires instant HTML delivery from edge. |
| **Content as TypeScript, not DB** | V1 has no CMS requirement. A typed array gives autocomplete, zero latency, and trivial add/remove of apps. |
| **GSAP + ScrollTrigger (client-only, dynamic import)** | Industry standard for scroll-pinned cinematic sequences. Dynamic import prevents SSR hydration conflicts. |
| **Canvas particle system (vanilla, not Three.js)** | Three.js adds ~600 KB. A custom 2D canvas system delivers the fluid organic effect at a fraction of the bundle cost. |
| **Single Route Handler for contact** | The only dynamic server need. Keeps the DB dependency isolated to one file. |
| **`public/apps/[slug]/` asset convention** | Predictable URL structure. Vercel CDN serves assets with cache headers. Adding an app = drop a folder. |
| **View Transitions API for page nav** | Native browser animation between `/` and `/apps/[slug]` with GSAP fallback for Safari < 18. Zero JS overhead when supported. |
