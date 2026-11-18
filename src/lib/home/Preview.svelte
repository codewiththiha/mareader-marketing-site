<script lang="ts">
  import { onMount } from "svelte";
  import Window from "$lib/window/Window.svelte";
  import { stateOf } from "$lib/film/steps";
  import { WIN_H, WIN_W, type R } from "$lib/window/state";
  import type { Site } from "$lib/looks";

  let { site, step, frames, label, focus }: { site: Site; step: number; frames: number[]; label: string; focus?: R } = $props();
  let el = $state<HTMLDivElement>();
  let width = $state(0);
  let visible = $state(false);
  let frame = $state(0);
  const area = $derived(focus ?? { x: 0, y: 0, w: WIN_W, h: WIN_H });
  const height = $derived((width * 10) / 16);
  const scale = $derived(width ? Math.max(width / area.w, height / area.h) : 0);
  const x = $derived(Math.min(0, Math.max(width - WIN_W * scale, width / 2 - (area.x + area.w / 2) * scale)));
  const y = $derived(Math.min(0, Math.max(height - WIN_H * scale, height / 2 - (area.y + area.h / 2) * scale)));
  const winState = $derived({ ...stateOf(step, frames[frame] ?? 0), ...(step === 4 ? { popover: null } : {}) });

  onMount(() => {
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "100px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  });

  $effect(() => {
    if (!visible || frames.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      frame = (frame + 1) % frames.length;
    }, 2400);
    return () => {
      window.clearInterval(id);
    };
  });
</script>

<div class="home-preview" role="img" aria-label={label} bind:this={el} bind:clientWidth={width}>
  <div class="home-preview-window" style:transform="translate({x}px, {y}px) scale({scale})" inert aria-hidden="true">
    <Window st={winState} {site} active={visible && step === 8} />
  </div>
</div>
