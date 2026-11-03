<script lang="ts">
  import { buildBars, type Mini } from "./minipage";

  let { kind, seed }: { kind: Mini; seed: number } = $props();
  const bars = $derived(buildBars(kind, seed));
</script>

<svg width="154" height="198" viewBox="0 0 154 198" aria-hidden="true">
  {#each bars as b, bi (bi)}
    <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.c} opacity={b.o} />
  {/each}
</svg>
