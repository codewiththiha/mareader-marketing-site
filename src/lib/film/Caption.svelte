<script lang="ts">
  import type { Layout } from "./layout";
  import type { Step } from "./steps";

  let { step, L, on, ink }: { step: Step; L: Layout; on: boolean; ink: { i: string; m: string } } = $props();

  const GH = "https://github.com/codewiththiha/mareader2";
  const RELEASES = `${GH}/releases/latest`;
  const SEP = " ";
  const words = $derived(step.title.split(" "));
  const cls = $derived(["cap", on ? "on" : "", L.landscape ? "land" : "port", step.hero ? "hero" : "", L.side].join(" "));
</script>

<div
  class={cls}
  style:left="{L.text.x}px"
  style:top="{L.text.y}px"
  style:width="{L.text.w}px"
  style:height="{L.text.h}px"
  style:color={ink.i}
  aria-hidden={!on ? "true" : undefined}
>
  {#if step.hero}
    <h1 class="cap-t">
      {#each words as w, i (i)}<span class="w" style="--d:{i * 38}ms">{w}</span>{SEP}{/each}
    </h1>
  {:else}
    <h2 class="cap-t">
      {#each words as w, i (i)}<span class="w" style="--d:{i * 38}ms">{w}</span>{SEP}{/each}
    </h2>
  {/if}
  <p class="cap-b b" style:color={ink.m}>{step.body}</p>
  {#if step.hero}
    <div class="cap-cta b">
      <a class="btn btn-accent" href={RELEASES} tabindex={on ? 0 : -1}>Download, it's free</a>
      <a class="btn btn-ghost" href={GH} tabindex={on ? 0 : -1}>View on GitHub</a>
    </div>
  {/if}
</div>
