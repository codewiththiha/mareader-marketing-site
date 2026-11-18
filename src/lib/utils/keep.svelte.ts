/** Keeps a subtree mounted while active and through its CSS exit transition. */
import { untrack } from "svelte";

export function keep(on: () => boolean, exitMs: number): () => boolean {
  let mounted = $state(on());
  $effect(() => {
    const active = on();
    if (active) {
      if (!untrack(() => mounted)) mounted = true;
      return;
    }
    if (!untrack(() => mounted)) return;
    const id = window.setTimeout(() => {
      mounted = false;
    }, exitMs);
    return () => {
      window.clearTimeout(id);
    };
  });
  return () => on() || mounted;
}
