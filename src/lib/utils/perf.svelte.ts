/** Adaptive capability profile: honours reduced motion, touch and slow GPUs. */
interface NetInfo {
  saveData?: boolean;
  effectiveType?: string;
}

interface RichNav extends Navigator {
  deviceMemory?: number;
  connection?: NetInfo;
}

function detectLite(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as RichNav;
  if (nav.connection?.saveData) return true;
  const kind = nav.connection?.effectiveType;
  if (kind === "slow-2g" || kind === "2g") return true;
  const cores = nav.hardwareConcurrency || 8;
  const mem = nav.deviceMemory ?? 8;
  if (mem <= 2 || cores <= 2) return true;
  return mem <= 4 && cores <= 4;
}

function makePerf() {
  const initialLite = detectLite();
  let reduced = $state(false);
  let coarse = $state(false);
  let lite = $state(initialLite);
  let hidden = $state(false);
  let slowStreak = 0;

  const syncAttr = (on: boolean) => {
    if (typeof document === "undefined") return;
    if (on) document.documentElement.dataset.lite = "1";
    else delete document.documentElement.dataset.lite;
  };

  if (typeof window !== "undefined") {
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqCoarse = window.matchMedia("(pointer: coarse)");
    reduced = mqReduce.matches;
    coarse = mqCoarse.matches || navigator.maxTouchPoints > 0;
    hidden = document.hidden;
    syncAttr(initialLite);

    mqReduce.addEventListener("change", (e) => {
      reduced = e.matches;
    });
    mqCoarse.addEventListener("change", (e) => {
      coarse = e.matches || navigator.maxTouchPoints > 0;
    });
    document.addEventListener("visibilitychange", () => {
      hidden = document.hidden;
      slowStreak = 0;
    });
  }

  return {
    get reduced() {
      return reduced;
    },
    get coarse() {
      return coarse;
    },
    get lite() {
      return lite;
    },
    get hidden() {
      return hidden;
    },
    sample(dtMs: number) {
      if (lite || hidden || dtMs > 150) {
        slowStreak = 0;
        return;
      }
      if (dtMs > 38) {
        slowStreak++;
        if (slowStreak >= 9) {
          lite = true;
          syncAttr(true);
        }
      } else if (dtMs < 24 && slowStreak > 0) {
        slowStreak--;
      }
    },
  };
}

export const perf = makePerf();
