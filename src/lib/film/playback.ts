import type { Step } from "./steps";

export interface Progress {
  ratio: number;
  remaining: number;
}

export function beatsFor(step: Step): number[] {
  const beats = step.beats;
  const durations = beats
    ? Array<number>(beats.count).fill(beats.ms)
    : step.frames.length > 1
      ? step.frames.map((_, i) => (Array.isArray(step.ms) ? step.ms[i] : step.ms) ?? (i === step.frames.length - 1 ? 620 : 1700))
      : [];
  let end = 0;
  return durations.map((ms) => (end += ms));
}

export class DemoClock {
  private elapsed = 0;
  private from: number | null = null;
  private speed = 1;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private beat = 0;
  private finished = false;
  private readonly duration: number;

  constructor(
    private readonly ends: number[],
    private readonly onBeat: (beat: number) => void,
    private readonly onFinish: () => void,
  ) {
    this.duration = ends.at(-1) ?? 0;
  }

  private time() {
    const running = this.from === null ? 0 : (performance.now() - this.from) * this.speed;
    return Math.min(this.duration, this.elapsed + running);
  }

  get progress(): Progress {
    const t = this.time();
    return { ratio: this.duration ? t / this.duration : 1, remaining: (this.duration - t) / this.speed };
  }

  get playing() {
    return this.from !== null;
  }

  resume() {
    if (this.from !== null || this.finished || this.duration === 0) return;
    this.from = performance.now();
    this.schedule();
  }

  pause() {
    this.elapsed = this.time();
    this.from = null;
    clearTimeout(this.timer);
  }

  rush(within: number) {
    if (!this.playing) return;
    const now = this.time();
    const speed = Math.max(this.speed, (this.duration - now) / within);
    if (speed === this.speed) return;
    this.pause();
    this.speed = speed;
    this.resume();
  }

  private schedule = () => {
    const now = this.time();
    let beat = this.beat;
    while (beat < this.ends.length - 1 && now >= this.ends[beat]) beat++;
    if (beat !== this.beat) {
      this.beat = beat;
      this.onBeat(beat);
    }
    if (now >= this.duration) {
      this.pause();
      this.finished = true;
      this.onFinish();
    } else {
      this.timer = setTimeout(this.schedule, Math.max(1, Math.ceil((this.ends[beat] - now) / this.speed)));
    }
  };
}
