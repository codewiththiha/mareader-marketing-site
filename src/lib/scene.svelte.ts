import { playhead, type Playhead, type Step } from "@/lib/timeline";

export interface Design {
  w: number;
  h: number;
}

export const DESKTOP: Design = { w: 1120, h: 700 };
export const COMPACT: Design = { w: 760, h: 640 };
const COMPACT_BELOW = 640;

export interface SceneOptions {
  hold?: number;
  threshold?: number;
  designs?: { desktop: Design; compact: Design };
}

export interface StageView {
  readonly design: Design;
  readonly compact: boolean;
  readonly fit: number;
  readonly caption: string;
  readonly focus: string | null;
  readonly zoom: number;
  readonly index: number;
  attach: (node: HTMLElement) => { destroy(): void };
}

export class Scene<S> implements StageView {
  #steps: Step<S>[];
  #initial: S;
  #duration: number;
  #hold: number;
  #threshold: number;
  #designs: { desktop: Design; compact: Design };
  width = $state(0);
  inView = $state(false);
  t = $state(0);
  ph: Playhead<S>;
  compact: boolean;
  design: Design;
  fit: number;

  constructor(steps: Step<S>[], initial: S, duration: number, options: SceneOptions = {}) {
    this.#steps = steps;
    this.#initial = initial;
    this.#duration = duration;
    this.#hold = options.hold ?? 900;
    this.#threshold = options.threshold ?? 0.3;
    this.#designs = options.designs ?? { desktop: DESKTOP, compact: COMPACT };
    this.ph = $derived(playhead(this.#steps, this.#initial, this.t));
    this.compact = $derived(this.width > 0 && this.width < COMPACT_BELOW);
    this.design = $derived(this.compact ? this.#designs.compact : this.#designs.desktop);
    this.fit = $derived(this.width > 0 ? this.width / this.design.w : 1);

    $effect(() => {
      if (!this.inView) return;
      let raf = 0;
      let at = this.t;
      let last = performance.now();
      const total = this.#duration + this.#hold;
      const tick = (now: number) => {
        const dt = Math.min(64, now - last);
        last = now;
        at += dt;
        if (at > total) at = 0;
        this.t = at;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(raf);
      };
    });
  }

  get caption(): string {
    return this.ph.caption;
  }

  get focus(): string | null {
    return this.ph.focus;
  }

  get zoom(): number {
    return this.ph.zoom;
  }

  get index(): number {
    return this.ph.index;
  }

  attach = (node: HTMLElement) => {
    const ro = new ResizeObserver(([entry]) => {
      if (entry) this.width = entry.contentRect.width;
    });
    ro.observe(node);
    this.width = node.getBoundingClientRect().width;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry) this.inView = entry.isIntersecting;
      },
      { threshold: this.#threshold },
    );
    io.observe(node);
    return {
      destroy: () => {
        ro.disconnect();
        io.disconnect();
      },
    };
  };
}

export type { Playhead };
