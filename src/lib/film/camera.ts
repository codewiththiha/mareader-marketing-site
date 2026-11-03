/** Critically damped spring on (centre, log-scale, anchor): the film camera. */
import type { V5 } from "./layout";

export class Camera {
  x: V5;
  v: V5 = [0, 0, 0, 0, 0];
  t: V5;
  raf = 0;
  last = 0;
  omega = 6.4;

  constructor(
    init: V5,
    private els: () => HTMLElement[],
  ) {
    this.x = [...init] as V5;
    this.t = [...init] as V5;
  }

  to(t: V5, snap: boolean) {
    this.t = [...t] as V5;
    if (snap) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.x = [...t] as V5;
      this.v = [0, 0, 0, 0, 0];
      this.apply();
      this.will(false);
      return;
    }
    if (!this.raf) {
      this.last = performance.now();
      this.will(true);
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  tick = (now: number) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000));
    this.last = now;
    const w = this.omega;
    const e = Math.exp(-w * dt);
    let moving = false;
    for (let k = 0; k < 5; k++) {
      const x0 = this.x[k] - this.t[k];
      const v0 = this.v[k];
      const c = v0 + w * x0;
      const x = (x0 + c * dt) * e;
      const v = (v0 - w * c * dt) * e;
      this.x[k] = this.t[k] + x;
      this.v[k] = v;
      const tol = k === 2 ? 0.0006 : 0.3;
      if (Math.abs(x) > tol || Math.abs(v) > tol * 3) moving = true;
    }
    if (!moving) this.x = [...this.t] as V5;
    this.apply();
    if (moving) this.raf = requestAnimationFrame(this.tick);
    else {
      this.raf = 0;
      this.will(false);
    }
  };

  apply() {
    const [cx, cy, z, ax, ay] = this.x;
    const s = Math.exp(z);
    const tr = `translate3d(${(ax - cx * s).toFixed(2)}px, ${(ay - cy * s).toFixed(2)}px, 0) scale(${s.toFixed(5)})`;
    for (const el of this.els()) el.style.transform = tr;
  }

  will(on: boolean) {
    for (const el of this.els()) el.style.willChange = on ? "transform" : "auto";
  }
}
