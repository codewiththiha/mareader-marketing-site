<script lang="ts">
  import { onMount } from "svelte";
  import Window from "$lib/window/Window.svelte";
  import { TIMELINES, shotState, type Timeline, type TimelineId } from "./timelines";
  import { WIN_H, WIN_W } from "$lib/window/state";
  import type { Site } from "$lib/looks";

  let { site, timeline, label }: { site: Site; timeline: TimelineId; label: string } = $props();
  let el = $state<HTMLDivElement>();
  let width = $state(0);
  let visible = $state(false);
  let reduced = $state(false);
  let tabVisible = $state(true);
  let frame = $state(0);
  const sequence: Timeline = $derived(TIMELINES[timeline]);
  const playing = $derived(visible && tabVisible && !reduced);
  const shot = $derived(sequence.shots[reduced ? sequence.poster : frame]);
  const area = $derived(shot.focus ?? { x: 0, y: 0, w: WIN_W, h: WIN_H });
  const height = $derived((width * 10) / 16);
  const scale = $derived(width ? Math.max(width / area.w, height / area.h) : 0);
  const x = $derived(Math.min(0, Math.max(width - WIN_W * scale, width / 2 - (area.x + area.w / 2) * scale)));
  const y = $derived(Math.min(0, Math.max(height - WIN_H * scale, height / 2 - (area.y + area.h / 2) * scale)));
  const winState = $derived(shotState(shot));

  onMount(() => {
    if (!el) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      reduced = motion.matches;
    };
    const syncVisibility = () => {
      tabVisible = !document.hidden;
    };
    syncMotion();
    syncVisibility();
    motion.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  });

  $effect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => {
      frame = (frame + 1) % sequence.shots.length;
    }, shot.ms);
    return () => {
      window.clearTimeout(id);
    };
  });
</script>

<div
  class="home-preview"
  role="img"
  aria-label={label}
  data-timeline={timeline}
  data-frame={reduced ? sequence.poster : frame}
  data-playing={playing}
  bind:this={el}
  bind:clientWidth={width}
>
  <div class="home-preview-window" style:transform="translate({x}px, {y}px) scale({scale})" inert aria-hidden="true">
    <Window st={winState} {site} active={playing} />
  </div>
</div>
