import type { AccentKey } from '@/lib/content/types';
import { prefersReducedMotion } from './reducedMotion';

// ── Accent colour palette (RGB tuples for lerp) ────────────────────────────
const ACCENT_COLORS: Record<AccentKey, [number, number, number]> = {
  plasma: [123,  79, 255],
  ember:  [255,  92,  53],
  aurora: [ 53, 255, 212],
  gold:   [232, 201, 122],
};

interface Particle {
  x:       number;
  y:       number;
  vx:      number;
  vy:      number;
  size:    number;
  opacity: number;
  phase:   number; // sinusoidal drift phase offset
  r:       number;
  g:       number;
  b:       number;
  tr:      number; // target r
  tg:      number; // target g
  tb:      number; // target b
}

const MAX_PARTICLES = 120;
const LERP_SPEED    = 0.02; // colour-shift interpolation speed per frame

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export class ParticleSystem {
  private canvas:   HTMLCanvasElement;
  private ctx:      CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private rafId:    number | null = null;
  private frame:    number = 0;
  private targetAccent: [number, number, number] = ACCENT_COLORS.plasma;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('ParticleSystem: failed to get 2D context');
    this.ctx = ctx;
  }

  /** Spawn (or re-spawn) `count` particles distributed across the canvas. */
  spawn(count: number): void {
    const [tr, tg, tb] = this.targetAccent;
    for (let i = 0; i < count; i++) {
      this.particles.push(this.makeParticle(tr, tg, tb));
    }
  }

  private makeParticle(tr: number, tg: number, tb: number): Particle {
    const { width: w, height: h } = this.canvas;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.15 + Math.random() * 0.25;
    return {
      x:       Math.random() * w,
      y:       Math.random() * h,
      vx:      Math.cos(angle) * speed,
      vy:      Math.sin(angle) * speed,
      size:    2 + Math.random() * 4,
      opacity: 0.15 + Math.random() * 0.55,
      phase:   Math.random() * Math.PI * 2,
      r: tr, g: tg, b: tb,
      tr, tg, tb,
    };
  }

  /** Advance physics + colour lerp for all particles. */
  update(): void {
    const { width: w, height: h } = this.canvas;
    this.frame++;

    for (const p of this.particles) {
      // Sinusoidal drift perpendicular to velocity direction
      const drift = Math.sin(this.frame * 0.008 + p.phase) * 0.18;
      p.x += p.vx + drift;
      p.y += p.vy + drift;

      // Wrap at edges
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      // Lerp colour toward target accent
      p.r = lerp(p.r, p.tr, LERP_SPEED);
      p.g = lerp(p.g, p.tg, LERP_SPEED);
      p.b = lerp(p.b, p.tb, LERP_SPEED);
    }
  }

  /** Draw all particles onto the canvas. */
  render(): void {
    const { width: w, height: h } = this.canvas;
    this.ctx.clearRect(0, 0, w, h);

    for (const p of this.particles) {
      const gradient = this.ctx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, p.size * 2.5,
      );
      gradient.addColorStop(0, `rgba(${Math.round(p.r)},${Math.round(p.g)},${Math.round(p.b)},${p.opacity})`);
      gradient.addColorStop(1, `rgba(${Math.round(p.r)},${Math.round(p.g)},${Math.round(p.b)},0)`);

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    }
  }

  /**
   * Shift all particle target colours toward the new accent.
   * Actual colour interpolation happens per-frame in `update()`.
   */
  setAccent(key: AccentKey): void {
    const [tr, tg, tb] = ACCENT_COLORS[key];
    this.targetAccent = [tr, tg, tb];
    for (const p of this.particles) {
      p.tr = tr;
      p.tg = tg;
      p.tb = tb;
    }
  }

  /** Start the requestAnimationFrame render loop. */
  start(): void {
    if (prefersReducedMotion()) {
      // Render a single static frame and stop — content still visible.
      this.render();
      return;
    }

    const loop = (): void => {
      this.update();
      this.render();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  /** Cancel the render loop. Call in component cleanup. */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /** Resize the canvas and redistribute particles. */
  resize(w: number, h: number): void {
    this.canvas.width  = w;
    this.canvas.height = h;
    // Recalculate particle count proportional to area, capped at MAX_PARTICLES
    const ideal = Math.min(Math.floor((w * h) / 12000), MAX_PARTICLES);
    this.particles = [];
    const [tr, tg, tb] = this.targetAccent;
    for (let i = 0; i < ideal; i++) {
      this.particles.push(this.makeParticle(tr, tg, tb));
    }
  }
}
