const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function stopsFor(height: number, count: number): number[] {
  const first = clamp(Math.round(height * 0.025), 14, 26);
  const opening = clamp(Math.round(height * 0.65), 260, 590);
  const chapter = clamp(Math.round(height * 0.46), 210, 430);
  return Array.from({ length: count + 1 }, (_, i) => (i === 0 ? 0 : i === 1 ? first : first + opening + (i - 2) * chapter));
}

export function sceneAt(offset: number, stops: number[]): number {
  let i = 0;
  while (i + 1 < stops.length - 1 && offset >= stops[i + 1]) i++;
  return i;
}

export class ScrollIntent {
  private y = 0;
  private time = 0;
  private travel = 0;

  reset(y: number, time: number) {
    this.y = y;
    this.time = time;
    this.travel = 0;
  }

  read(y: number, time: number, height: number) {
    const delta = y - this.y;
    if (time - this.time > 220 || delta < -2) this.travel = 0;
    if (delta > 0) this.travel += delta;
    this.y = y;
    this.time = time;
    return { delta, fast: delta >= Math.max(118, height * 0.23) || this.travel >= Math.max(132, height * 0.28) };
  }
}

export function canHold(current: number, target: number, offset: number, stops: number[], fast: boolean): boolean {
  if (fast || target !== current + 1) return false;
  const overshoot = offset - stops[target];
  return overshoot < Math.min(104, (stops[target + 1] - stops[target]) * 0.25);
}
