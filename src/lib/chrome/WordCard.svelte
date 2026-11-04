<script lang="ts">
  import Icon from "$lib/icons/Icon.svelte";
  import { Volume2, X } from "$lib/icons/nodes";
  import type { Anchor } from "./anchor";

  let { open, at, roomW }: { open: boolean; at: Anchor | null; roomW: number } = $props();

  const CARD_W = 320;
  const GAP = 11;
  const CARET = 8;
  const CORNER = 16;
  const CHIPS = ["recognized", "accepted", "assumed", "understood", "taken for granted"];
  const USES = [
    "Her contribution was acknowledged in the report.",
    "He acknowledged that the first plan had failed.",
    "The report acknowledges the limits of the evidence.",
  ];

  let ref = $state(null as HTMLDivElement | null);
  let h = $state(372);
  $effect(() => {
    const el = ref;
    const a = at;
    const o = open;
    if (el && (a !== null || !o)) h = el.offsetHeight;
  });

  const mid = $derived(at ? at.x + at.w / 2 : 0);
  const left = $derived(at ? Math.max(8, Math.min(roomW - 8 - CARD_W, mid - CARD_W / 2)) : 0);
  const top = $derived(at ? at.y - GAP - h : 0);
  const cx = $derived(Math.max(CORNER, Math.min(CARD_W - CORNER, mid - left)));
  const delay = (i: number) => `animation-delay: ${120 + i * 110}ms`;
</script>

{#if at}
  <div bind:this={ref} class="wc" class:on={open} style:left="{left}px" style:top="{top}px" style:width="{CARD_W}px">
    <div class="wc-head">
      <span class="wc-word">acknowledged</span>
      <span class="wc-pos">verb</span>
      <span class="wc-lvl">B1</span>
      <span class="wc-icon" style:margin-left="auto"><Icon node={Volume2} size={17} strokeWidth={1.8} ariaHidden /></span>
      <span class="wc-icon"><Icon node={X} size={17} strokeWidth={1.8} ariaHidden /></span>
    </div>
    {#key open ? "o" : "c"}
      <div class="wc-body stream">
        <div class="wc-lab" style={delay(0)}>Meaning</div>
        <div class="wc-text" style={delay(1)}>
          Accepted as true or recognized. Here, Austen frames a belief about wealthy bachelors and marriage as unquestioned, with a wry
          edge.
        </div>
        <div class="wc-lab" style={delay(2)}>Synonyms</div>
        <div class="wc-chips" style={delay(3)}>
          {#each CHIPS as s (s)}<span>{s}</span>{/each}
        </div>
        <div class="wc-lab" style={delay(4)}>Usages</div>
        <ul class="wc-uses" style={delay(5)}>
          {#each USES as u (u)}<li>{u}</li>{/each}
        </ul>
        <div class="wc-foot" style={delay(6)}>
          <span>Assistant-generated sample</span>
          <span class="wc-again">Ask again</span>
        </div>
      </div>
    {/key}
    <svg class="wc-caret" width={CARET * 2 + 2} height={CARET + 2} style:left="{cx - CARET - 1}px" aria-hidden="true">
      <path d="M0 0 L{CARET * 2 + 2} 0 L{CARET * 2 + 2} 1 L{CARET * 2 + 1} 1 L{CARET + 1} {CARET + 1} L1 1 L0 1 Z" fill="var(--wc-bg)" />
      <path d="M1 1 L{CARET + 1} {CARET + 1} L{CARET * 2 + 1} 1" fill="none" stroke="var(--l)" stroke-width="1" />
    </svg>
  </div>
{/if}
