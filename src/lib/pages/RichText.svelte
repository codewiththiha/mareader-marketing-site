<script lang="ts">
  import type { Token } from "./rich";

  let { tokens, marks = false, onSel }: { tokens: Token[]; marks?: boolean; onSel?: (el: HTMLElement) => void } = $props();

  function selRef(el: HTMLElement, sel: boolean | undefined) {
    if (sel && onSel) onSel(el);
  }
</script>

{#each tokens as t, ti (ti)}
  {#if t.kind === "text"}
    {t.text}
  {:else if t.kind === "em"}
    <i>{t.text}</i>
  {:else}
    <span
      class="mk"
      class:on={marks}
      class:sel={t.sel && marks}
      style:transition-delay={marks ? `${t.index * 70}ms` : "0ms"}
      use:selRef={t.sel}
    >
      {t.text}
    </span>
  {/if}
{/each}
