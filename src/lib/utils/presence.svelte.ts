import { untrack } from "svelte";

export function retain(show: () => boolean, outroMs: number) {
  let leaving = $state(false);
  $effect(() => {
    if (show()) {
      leaving = true;
    } else if (untrack(() => leaving)) {
      const timer = setTimeout(() => (leaving = false), outroMs);
      return () => {
        clearTimeout(timer);
      };
    }
  });
  return () => show() || leaving;
}
