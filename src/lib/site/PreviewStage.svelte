<!-- One live mock window, cropped by a slow camera, playing only while seen. -->
<script lang="ts">
  import type { Site } from "$lib/looks";
  import type { Frame, Rect } from "$lib/site/previews";
  import Window from "$lib/window/Window.svelte";
  import { DEFAULT_STATE, WIN_H, WIN_W } from "$lib/window/state";

  let { id, frames, rect, site, poster = 0 }: { id: string; frames: Frame[]; rect: Rect; site: Site; poster?: number } = $props();

  type SaveData = EventTarget & { saveData?: boolean };
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saved = (navigator as Navigator & { connection?: SaveData }).connection;

  let host = $state<HTMLDivElement | null>(null);
  let box = $state({ w: 0, h: 0 });
  let near = $state(false);
  let seen = $state(false);
  let easy = $state(!motion.matches && !saved?.saveData);

  let index = $state(0);
  const playing = $derived(seen && easy && frames.length > 1);
  const frame = $derived(frames[playing ? index : poster] ?? frames[0]);
  const st = $derived({ ...DEFAULT_STATE, ...frame.st });
  const view = $derived(frame.rect ?? rect);

  $effect(() => {
    if (!playing) {
      index = 0;
      return;
    }
    const t = window.setTimeout(() => {
      index = (index + 1) % frames.length;
    }, frame.ms);
    return () => {
      window.clearTimeout(t);
    };
  });

  const cam = $derived.by(() => {
    const { w, h } = box;
    if (!w || !h) return "translate(0px, 0px) scale(0.4)";
    const s = Math.max(w / view.w, h / view.h);
    const x = (w - view.w * s) / 2 - view.x * s;
    const y = (h - view.h * s) / 2 - view.y * s;
    return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(5)})`;
  });

  $effect(() => {
    const el = host;
    if (!el) return;
    const read = () => (box = { w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);

    const enter = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) near = true;
      },
      { rootMargin: "620px" },
    );
    const leave = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) near = false;
      },
      { rootMargin: "1700px" },
    );
    enter.observe(el);
    leave.observe(el);
    const seenBy = new IntersectionObserver(([e]) => (seen = e.isIntersecting && e.intersectionRatio >= 0.35), {
      threshold: [0, 0.35],
    });
    seenBy.observe(el);

    const calm = () => (easy = !motion.matches && !saved?.saveData && !document.hidden);
    document.addEventListener("visibilitychange", calm);
    motion.addEventListener("change", calm);
    saved?.addEventListener("change", calm);
    return () => {
      ro.disconnect();
      enter.disconnect();
      leave.disconnect();
      seenBy.disconnect();
      document.removeEventListener("visibilitychange", calm);
      motion.removeEventListener("change", calm);
      saved?.removeEventListener("change", calm);
    };
  });
</script>

<div class="mock-stage" bind:this={host} data-stage={id} data-playing={playing}>
  <div class="mock-cam" style="transform: {cam}; width: {WIN_W}px; height: {WIN_H}px">
    {#if near}
      <Window {st} {site} active={playing} />
    {/if}
  </div>
  <div class="mock-grain" aria-hidden="true"></div>
</div>
