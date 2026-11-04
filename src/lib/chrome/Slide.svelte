<script lang="ts">
  import type { SlideGroup } from "$lib/utils/slide.svelte";

  let {
    group,
    radius = 10,
    bg = "color-mix(in srgb, var(--ink) 7%, transparent)",
    ring = "inset 0 0 0 1px color-mix(in srgb, var(--ink) 12%, transparent)",
  }: { group: SlideGroup; radius?: number; bg?: string; ring?: string } = $props();

  let self = $state<HTMLSpanElement | undefined>();
  let off = $state({ x: 0, y: 0, w: 0, h: 0 });
  let on = $state(false);
  let jump = $state(false);
  let was = false;

  // both rects come from one tick and are divided by the host's own scale, so a scaled ancestor (camera, popover) cannot skew them
  const place = (host: HTMLElement, el: HTMLElement) => {
    const h = host.getBoundingClientRect();
    const t = el.getBoundingClientRect();
    const k = host.offsetWidth > 0 ? h.width / host.offsetWidth : 1;
    if (!k) return false;
    off = {
      x: (t.left - h.left) / k - host.clientLeft,
      y: (t.top - h.top) / k - host.clientTop,
      w: t.width / k,
      h: t.height / k,
    };
    return true;
  };

  $effect(() => {
    const host = self?.parentElement;
    const el = group.el;
    if (!host) return;
    if (!el) {
      on = false;
      was = false;
      return;
    }
    const first = !was;
    if (first) {
      on = false;
      jump = true;
    }
    if (!place(host, el)) return;
    on = true;
    was = true;
    const raf = requestAnimationFrame(() => {
      jump = false;
    });
    const ro = new ResizeObserver(() => {
      if (el.isConnected) place(host, el);
    });
    ro.observe(host);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      jump = false;
    };
  });
</script>

<span
  bind:this={self}
  class="slide-mark"
  class:on={on && group.shown}
  class:jump
  style:left="{off.x}px"
  style:top="{off.y}px"
  style:width="{off.w}px"
  style:height="{off.h}px"
  style:border-radius="{radius}px"
  style:--slide-bg={bg}
  style:--slide-ring={ring}
  aria-hidden="true"
></span>

<style>
  .slide-mark {
    position: absolute;
    left: 0;
    top: 0;
    background: var(--slide-bg);
    box-shadow: var(--slide-ring);
    opacity: 0;
    pointer-events: none;
    transition:
      left 0.34s var(--e-pane),
      top 0.34s var(--e-pane),
      width 0.34s var(--e-pane),
      height 0.34s var(--e-pane),
      border-radius 0.34s var(--e-pane),
      opacity 0.2s ease;
  }
  .slide-mark.on {
    opacity: 1;
  }
  .slide-mark.jump {
    transition: none;
  }
</style>
