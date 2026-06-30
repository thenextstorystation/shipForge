'use client';

import { prefersReducedMotion } from './reducedMotion';

export interface ScrollRevealOpts {
  y?:        number;
  x?:        number;
  duration?: number;
  delay?:    number;
  ease?:     string;
  start?:    string;
}

export interface PinSceneOpts {
  pinnedLength?: string; // e.g. '100%' — defaults to '100%'
  start?:        string;
  end?:          string;
  scrub?:        boolean | number;
  markers?:      boolean;
}

let gsapInitialised = false;

export async function initGSAP(): Promise<void> {
  if (gsapInitialised) return;
  if (typeof window === 'undefined') return;

  const { gsap }          = await import('gsap');
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');

  gsap.registerPlugin(ScrollTrigger);

  // Global defaults
  gsap.defaults({ ease: 'power2.out', duration: 0.8 });

  // Keep ScrollTrigger in sync with smooth-scroll libraries if added later
  ScrollTrigger.config({ ignoreMobileResize: true });

  gsapInitialised = true;
}

/**
 * Scroll-triggered reveal: element fades + slides into view.
 * No-op when prefers-reduced-motion is active.
 */
export async function scrollReveal(
  el: Element,
  opts: ScrollRevealOpts = {},
): Promise<void> {
  if (prefersReducedMotion()) return;

  const { gsap }          = await import('gsap');
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');

  gsap.fromTo(
    el,
    { opacity: 0, y: opts.y ?? 40, x: opts.x ?? 0 },
    {
      opacity:       1,
      y:             0,
      x:             0,
      duration:      opts.duration ?? 0.9,
      delay:         opts.delay    ?? 0,
      ease:          opts.ease     ?? 'power2.out',
      scrollTrigger: {
        trigger: el,
        start:   opts.start ?? 'top 85%',
        toggleActions: 'play none none none',
      },
    },
  );

  // Type-only reference to satisfy TS — ScrollTrigger is registered above.
  void ScrollTrigger;
}

/**
 * Pin a scroll scene for an extended scroll distance.
 * Returns a cleanup function that kills the ScrollTrigger instance.
 */
export async function pinScene(
  trigger: Element,
  opts: PinSceneOpts = {},
): Promise<() => void> {
  if (prefersReducedMotion()) return () => undefined;

  const { ScrollTrigger } = await import('gsap/ScrollTrigger');

  const st = ScrollTrigger.create({
    trigger,
    start:   opts.start        ?? 'top top',
    end:     opts.end          ?? `+=${opts.pinnedLength ?? '100%'}`,
    pin:     true,
    scrub:   opts.scrub        ?? false,
    markers: opts.markers      ?? false,
  });

  return () => st.kill();
}
