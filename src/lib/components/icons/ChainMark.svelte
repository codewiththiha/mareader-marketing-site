<script lang="ts">
  // ChainMark — coin and chain glyphs from marks.ts
  import { MARKS } from "@/lib/support/marks";

  let { id, size = 18 }: { id: string; size?: number } = $props();
  let parts = $derived(MARKS[id] ?? []);
</script>

<svg class="cm" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" data-mark={id}>
  {#each parts as p, i (i)}
    {#if p.stroke}
      <path
        d={p.d}
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
        stroke-linecap="round"
        stroke-linejoin="round"
        transform={p.t}
      ></path>
    {:else}
      <path d={p.d} fill="currentColor" transform={p.t}></path>
    {/if}
  {/each}
</svg>
