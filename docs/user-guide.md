# TheDeveloper — User Guide

*How to explore the portfolio and get in touch*

---

## Welcome

TheDeveloper is a cinematic, scroll-based portfolio showcasing a curated collection of applications. The experience is designed to feel like moving through a film — each app gets its own full-screen moment, and every interaction is smooth and intentional. This guide explains how to navigate the site, explore individual apps, and reach out.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [The Loading Screen](#2-the-loading-screen)
3. [The Hero Section](#3-the-hero-section)
4. [Browsing the App Showcase](#4-browsing-the-app-showcase)
5. [App Detail Pages](#5-app-detail-pages)
6. [The Contact Section](#6-the-contact-section)
7. [Navigation](#7-navigation)
8. [Accessibility](#8-accessibility)
9. [Device & Browser Support](#9-device--browser-support)
10. [Frequently Asked Questions](#10-frequently-asked-questions)

---

## 1. Getting Started

Open the site URL in any modern browser. No account, login, or installation is required. The full experience loads automatically.

**Recommended browsers:**

| Browser | Minimum Version |
|---|---|
| Chrome / Chromium | 112+ |
| Safari | 16.4+ |
| Firefox | 113+ |
| Edge | 112+ |

The site works on any screen size — desktop, tablet, and phone. For the fullest cinematic experience, a desktop or large tablet in landscape orientation is ideal.

---

## 2. The Loading Screen

When you first arrive, a brief loading screen appears before the site reveals itself.

- **What you see:** The site name assembles character by character, followed by a slim progress indicator.
- **How long it takes:** Approximately 3 seconds on a standard connection. The screen exits automatically — there is nothing to click.
- **If you have reduced motion enabled** in your operating system settings, the loading screen skips its animations and reveals the site within about half a second.

You do not need to do anything during the loading screen. It resolves on its own.

---

## 3. The Hero Section

After the loading screen exits, the full hero landing section animates into view.

**What you will see:**

- The **TheDeveloper** name displayed as a large gradient headline
- A short **tagline** describing the portfolio
- A **scroll indicator** at the bottom of the screen — an animated chevron pointing downward with the label "Scroll to explore"
- A **particle field** in the background: softly drifting glowing dots that shift colour as you move through the portfolio
- Decorative **concentric rotating rings** behind the headline

**What to do:** Simply scroll down to begin the app showcase journey. The scroll indicator will fade once you start moving.

---

## 4. Browsing the App Showcase

The core of the site is a scroll-driven sequence of full-screen app presentations. Each app in the portfolio gets its own dedicated scroll moment.

### How it works

As you scroll down, each app scene pins to the viewport and animates in. The card stays in view while you scroll through its dedicated zone, then transitions out as the next app takes over.

### What each app card shows

| Element | Description |
|---|---|
| **App icon** | The app's logo or brand mark |
| **Category & year** | Small label showing the platform type and year of completion |
| **App name** | Large display headline |
| **Tagline** | One-sentence description of what the app does |
| **Cover screenshot** | A preview image of the app in use |
| **"See Full Story" button** | Opens the dedicated detail page for this app |

### Visual variety

Each app has a distinct accent colour — purple (plasma), orange-red (ember), teal (aurora), or gold. The background particle field and subtle glow effects shift to match the current app's colour as you scroll through. This gives each app its own atmosphere.

### Scroll progress indicator

A thin vertical bar on the right edge of the screen tracks your position within the showcase. Small dots along the bar represent each app. Clicking a dot jumps directly to that app's scene.

### Tips for browsing

- **Scroll at your own pace.** Each scene is pinned for a full viewport height of scroll distance, so there is no rush.
- **On mobile,** swipe up continuously — the experience is fully optimised for touch.
- **The background animations** (particles, orbs) are always running. They are purely decorative and do not require interaction.

---

## 5. App Detail Pages

Clicking **"See Full Story"** on any app card opens that app's dedicated detail page at `/apps/[app-name]`.

### What the detail page contains

#### App header
The app name, icon, and full description are displayed prominently at the top with an accent glow matching the app's colour.

#### Feature highlights
Three to five key features are displayed as animated cards, each with an icon, a short title, and a one-to-two sentence description. These animate in as you scroll to them.

#### Screenshot gallery
A swipeable carousel of screenshots. Use the following controls:

| Action | Control |
|---|---|
| Next screenshot | Click the right arrow, or swipe right on touch |
| Previous screenshot | Click the left arrow, or swipe left on touch |
| Jump to a specific screenshot | Click the dot indicators below the carousel |

Screenshots are shown at full quality. Click or tap a screenshot to view it at larger size if a lightbox is provided.

#### Demo video
If a demo video is available for an app, an embedded video player appears below the screenshots. Click the play button to start the video. A fullscreen button is available within the player controls.

#### Visit the live app
A prominent **"Visit Live App"** button links to the app's live URL. This opens in a new browser tab so you do not lose your place on the portfolio.

#### Back navigation
A **back button** in the upper area of the detail page returns you to the main portfolio scroll journey. If you arrived at the detail page directly (e.g. from a shared link), the back button takes you to the portfolio home page instead.

---

## 6. The Contact Section

The contact section is at the very bottom of the main page, below all the app scenes. It serves as the closing scene of the portfolio.

### Contact form

Fill in the three fields and click **Send**:

| Field | Notes |
|---|---|
| **Name** | Required. Up to 100 characters. |
| **Email** | Required. Must be a valid email address. |
| **Message** | Required. Up to 2,000 characters. |

After you click Send:

- The form validates your input immediately. If any field has an error, a message appears below that field explaining what to fix.
- If validation passes, your message is submitted. The form shows a success confirmation and clears itself.
- If a technical error occurs on submission, an error message appears. Your typed content is preserved so you can try again.

**Note:** The form includes a hidden anti-spam field that is invisible to human users. If you are filling in the form normally, you do not need to do anything about it.

### Social links and direct email

Below the contact form you will find:

- **GitHub** — link to the developer's code repositories
- **LinkedIn** — professional profile
- **Twitter / X** — social presence
- **Direct email address** — styled as a clickable mailto link

All social links open in a new tab.

---

## 7. Navigation

### Fixed navigation bar

A navigation bar is fixed to the top of the screen on all pages. It contains:

| Element | Behaviour |
|---|---|
| **TheDeveloper logo / wordmark** | Clicks return to the top of the home page |
| **Work** | Scrolls to the app showcase section |
| **Contact** | Scrolls to the contact section |
| **"Let's Talk" button** | Scrolls directly to the contact form |

On desktop, the nav bar is initially minimal and gains a frosted-glass background as you scroll down. On mobile, the nav links collapse into a hamburger menu — tap the icon to open the drawer, tap again or tap outside to close it.

### Keyboard navigation

All interactive elements — nav links, app CTAs, carousel controls, form fields, and the submit button — are reachable by pressing **Tab**. Use **Enter** or **Space** to activate buttons and links. The Escape key closes any open modal or overlay.

### Direct links to app pages

Every app detail page has a permanent, shareable URL in the format `/apps/[slug]`. You can copy and share this URL directly — the recipient will land on the app's detail page with full content loaded.

---

## 8. Accessibility

TheDeveloper is built with accessibility in mind.

### Reduced motion

If you have enabled **"Reduce Motion"** in your operating system or browser settings (found under Accessibility settings on macOS, iOS, Windows, and Android), the site automatically detects this preference and:

- Skips the preloader animation (reveals the site after a short pause instead)
- Disables GSAP scroll animations (content is still fully visible and readable)
- Stops the particle canvas animation (a static frame is shown instead)
- Removes CSS keyframe animations from orbs and rings

All content remains fully accessible — only the motion is reduced, not the information.

### Screen readers

All images have descriptive alt text. Decorative background elements are marked with `aria-hidden` so screen readers skip them. Form fields have associated labels.

### Colour contrast

Body text meets WCAG AA contrast requirements against the dark backgrounds used throughout the site. Accent colours are used for decorative and highlight purposes and are not the sole means of conveying information.

---

## 9. Device & Browser Support

| Environment | Status |
|---|---|
| Desktop (Chrome, Edge, Firefox, Safari) | ✅ Full experience |
| Tablet — landscape | ✅ Full experience |
| Tablet — portrait | ✅ Optimised layout |
| Mobile (iOS Safari, Android Chrome) | ✅ Fully responsive |
| Internet Explorer | ❌ Not supported |
| Browsers without JavaScript | ⚠️ Static HTML content visible; animations unavailable |

**Performance note:** The animation system and particle canvas are deferred — they do not block the initial page load. Static HTML is delivered instantly from the CDN edge; animations layer on top after the page is interactive.

---

## 10. Frequently Asked Questions

**The animations are very fast / slow on my machine — is that normal?**
Animation speed is tied to the content, not your machine's frame rate. GSAP adapts to your display's refresh rate. If the experience feels sluggish, try enabling "Reduce Motion" in your OS settings — the site will detect it and disable heavy animations.

**I shared a link to an app page and the preview image looks wrong.**
Each app page has its own Open Graph image used by social platforms. If the platform cached an old image, try re-scraping the URL using the platform's URL debugger (e.g. LinkedIn Post Inspector, Facebook Sharing Debugger).

**The contact form says my message was sent but I haven't heard back.**
Form submissions are stored and reviewed by the developer. Response times depend on current availability — allow a few business days.

**Can I link directly to a specific app?**
Yes. Copy the URL from your browser's address bar while on any app detail page — the URL takes the form `https://[site-domain]/apps/[app-name]` and is fully shareable.

**The site is blank / not loading.**
Ensure JavaScript is enabled in your browser. If you are on a corporate or VPN network, check that the site's domain is not blocked. Try a hard refresh with **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (macOS).

**Why is my cursor hidden on desktop?**
The site uses a custom animated cursor on desktop devices. If you see no cursor, the custom cursor has replaced the default one. It tracks your mouse position — move your mouse to locate it. On touch devices, no custom cursor is shown.

---

*TheDeveloper — built with precision, creativity, and obsessive polish.*
