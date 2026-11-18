<script lang="ts">
  import { OS_LABEL } from "$lib/site/downloads";
  import { router } from "$lib/site/router.svelte";
  import { platform } from "$lib/utils/platform.svelte";
  import type { Layout } from "./layout";
  import type { Step } from "./steps";

  let {
    step,
    n,
    total,
    L,
    on,
    playing,
    prog,
    cue,
  }: {
    step: Step;
    n: number;
    total: number;
    L: Layout;
    on: boolean;
    playing: boolean;
    prog: number;
    cue?: () => void;
  } = $props();

  const GH = "https://github.com/codewiththiha/mareader2";
  const SEP = " ";
  const pad = (v: number) => String(v).padStart(2, "0");
  const words = $derived(step.title.split(" "));
  const cls = $derived(["cap", on ? "on" : "", L.landscape ? "land" : "port", step.hero ? "hero" : "", L.side].join(" "));
</script>

<div
  class={cls}
  style:left="{L.text.x}px"
  style:top="{L.text.y}px"
  style:width="{L.text.w}px"
  style:height="{L.text.h}px"
  aria-hidden={!on ? "true" : undefined}
>
  {#if !step.hero}
    <p class="cap-k b"><span class="cap-i">{pad(n)} / {pad(total - 1)}</span> {step.kicker}</p>
    {#if playing}
      <span class="cap-p" aria-hidden="true"><i style:transform="scaleX({Math.min(1, prog)})"></i></span>
    {/if}
  {/if}
  {#if step.hero}
    <h1 class="cap-t">
      {#each words as w, i (i)}<span class="w" style="--d:{i * 38}ms">{w}</span>{SEP}{/each}
    </h1>
  {:else}
    <h2 class="cap-t">
      {#each words as w, i (i)}<span class="w" style="--d:{i * 38}ms">{w}</span>{SEP}{/each}
    </h2>
  {/if}
  <p class="cap-b b">{step.body}</p>
  {#if step.hero}
    <div class="cap-cta b">
      <a class="btn btn-accent" href={router.href("download")} tabindex={on ? 0 : -1}>Download for {OS_LABEL[platform.os]}</a>
      <a class="btn btn-ghost" href={GH} tabindex={on ? 0 : -1}>View on GitHub</a>
    </div>
    <button
      class="cue b"
      onclick={() => {
        cue?.();
      }}
      tabindex={on ? 0 : -1}
      aria-label="Start the reel"
    >
      <svg class="cue-a" viewBox="0 0 10 18" width="11" height="20" aria-hidden="true"
        ><path
          d="M5 1v14M1 11l4 4 4-4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.15"
          stroke-linecap="round"
          stroke-linejoin="round"
        /></svg
      >
      <span class="cue-t">Scroll</span>
      <span class="cue-n">{total - 1} takes · nothing to press</span>
    </button>
  {/if}
</div>
