/** Adaptive interval counter that speeds up with scroll pace and pauses off-tab. */
import { perf } from "./perf.svelte";

export function ticker(on: () => boolean, ms: () => number): () => number {
  let n = $state(0);
  $effect(() => {
    if (!on()) {
      n = 0;
      return;
    }
    if (perf.hidden) return;
    let id = 0;
    const arm = () => {
      const delay = Math.max(120, ms());
      id = window.setTimeout(() => {
        n++;
        arm();
      }, delay);
    };
    arm();
    return () => {
      window.clearTimeout(id);
    };
  });
  return () => n;
}
