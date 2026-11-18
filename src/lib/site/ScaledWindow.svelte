<script lang="ts">
  import Window from "$lib/window/Window.svelte";
  import { WIN_H, WIN_W, type WinState } from "$lib/window/state";
  import type { Site } from "$lib/looks";

  let { st, site, active = true, label }: { st: WinState; site: Site; active?: boolean; label: string } = $props();

  let box = $state<HTMLElement | null>(null);
  let scale = $state(0.3);

  $effect(() => {
    if (!box) return;
    const el = box;
    const fit = () => {
      scale = el.clientWidth / WIN_W;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  });
</script>

// ScaledWindow — a live reader window fitted to its card

<div class="scaled-win" bind:this={box} role="img" aria-label={label}>
  <div class="scaled-inner" style="width:{WIN_W}px;height:{WIN_H}px;transform:scale({scale})">
    <Window {st} {site} {active} />
  </div>
</div>
