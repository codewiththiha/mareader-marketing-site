/** Interval counter used by the read-aloud player and the key rotation demo. */
export function ticker(on: () => boolean, ms: () => number): () => number {
  let n = $state(0);
  $effect(() => {
    if (!on()) return;
    n = 0;
    const id = window.setInterval(() => n++, ms());
    return () => {
      window.clearInterval(id);
    };
  });
  return () => n;
}
