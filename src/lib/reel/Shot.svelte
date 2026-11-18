<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Site } from "$lib/looks";
  import { lite } from "$lib/utils/power";
  import Window from "$lib/window/Window.svelte";
  import { fitTo } from "./frame";
  import { cycleMs, durationAt, focusOf, modeOf, needsOf, stateOf, type Shot } from "./shots";

  let {
    shot,
    index,
    site,
    portrait,
    onSeen,
    lead,
  }: {
    shot: Shot;
    index: number;
    site: Site;
    portrait: boolean;
    onSeen: (i: number) => void;
    lead?: Snippet;
  } = $props();

  const reach = $derived(needsOf(index));
  const cycle = $derived(cycleMs(index));
  const number = $derived(index === 0 ? "00" : String(index).padStart(2, "0"));
  const loops = $derived(shot.frames.length > 1 && shot.loop === true);

  let host = $state<HTMLElement | null>(null);
  let screen = $state<HTMLElement | null>(null);
  let frame = $state(0);
  let near = $state(false);
  let live = $state(false);
  let size = $state({ w: 0, h: 0 });

  const fit = $derived(fitTo(size.w, size.h, focusOf(index, portrait), modeOf(index, portrait)));
  const ratio = $derived(portrait ? (shot.wide ? "16 / 10" : "3 / 4") : "8 / 5");
  const st = $derived(stateOf(index, frame));

  $effect(() => {
    const el = host;
    const box = screen ?? el;
    if (!el || !box) return;

    const nearIO = new IntersectionObserver(
      (rows) => {
        near = rows[rows.length - 1].isIntersecting;
      },
      { rootMargin: "80% 0px 80% 0px" },
    );
    const liveIO = new IntersectionObserver(
      (rows) => {
        const row = rows[rows.length - 1];
        live = row.isIntersecting && row.intersectionRatio > 0.3 && document.visibilityState === "visible";
        if (row.isIntersecting) onSeen(index);
      },
      { threshold: [0, 0.3, 0.6, 1] },
    );
    nearIO.observe(el);
    liveIO.observe(el);

    const read = () => {
      size = { w: box.clientWidth, h: box.clientHeight };
    };
    const ro = new ResizeObserver(read);
    ro.observe(box);
    read();

    return () => {
      nearIO.disconnect();
      liveIO.disconnect();
      ro.disconnect();
    };
  });

  $effect(() => {
    if (!live) return;
    const last = shot.frames.length - 1;
    frame = 0;
    if (last < 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame = last;
      return;
    }
    let f = 0;
    let t = 0;
    const step = () => {
      t = window.setTimeout(
        () => {
          const end = f >= last;
          if (end && shot.loop !== true) return;
          f = end ? (shot.loopFrom ?? 0) : f + 1;
          frame = f;
          step();
        },
        durationAt(index, f),
      );
    };
    step();
    return () => {
      window.clearTimeout(t);
    };
  });
</script>

<article
  bind:this={host}
  id="shot-{shot.id}"
  class="shot"
  class:hero={shot.hero}
  data-shot={shot.id}
  aria-labelledby="shot-title-{shot.id}"
  style="--fit-k:{fit.k};--fit-x:{fit.x.toFixed(2)}px;--fit-y:{fit.y.toFixed(2)}px;--shot-ar:{ratio}"
>
  {#if shot.hero && lead}
    <div class="shot-lead">{@render lead()}</div>
  {/if}

  <div class="shot-strip">
    <span class="shot-tag">
      <i class="shot-dot" class:on={live}></i>
      {#if shot.hero}the reel{:else}{number} · {shot.kicker}{/if}
      {#if loops}<em>loop</em>{/if}
    </span>
    {#if loops}<span class="shot-meta">{Math.round(cycle / 100) / 10}s loop</span>{/if}
  </div>

  <div class="shot-frame" class:calm={!live}>
    <div class="shot-screen" bind:this={screen}>
      {#if near}
        <div class="shot-inner"><Window {st} {site} active={live} {reach} instant {lite} /></div>
      {:else}
        <div class="shot-hold"></div>
      {/if}
    </div>

    {#if loops}
      <div class="shot-bar" class:on={live} style="--d:{cycle}ms"><i></i></div>
    {/if}
  </div>

  {#if !shot.hero}
    <div class="shot-text">
      <div class="shot-head">
        <span class="shot-n">{number}</span>
        <h2 id="shot-title-{shot.id}" class="shot-t">{shot.title}</h2>
      </div>
      <p class="shot-b">{shot.body}</p>
    </div>
  {/if}
</article>
