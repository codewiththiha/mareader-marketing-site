<script lang="ts">
  import type { SlideGroup } from "$lib/utils/slide.svelte";

  let {
    group,
    radius = 10,
    bg = "color-mix(in srgb, var(--ink) 7%, transparent)",
    ring = "inset 0 0 0 1px color-mix(in srgb, var(--ink) 12%, transparent)",
  }: { group: SlideGroup; radius?: number; bg?: string; ring?: string } = $props();

  let self = $state<HTMLSpanElement | undefined>();
  let off = $state({ x: 0, y: 0 });
  // viewport rects from the group, re-based onto the marker's own container
  $effect(() => {
    const target = group.rect;
    const host = self?.parentElement;
    if (!target || !host) return;
    const h = host.getBoundingClientRect();
    off = { x: target.x - h.left - host.clientLeft, y: target.y - h.top - host.clientTop };
  });
</script>

<span
  bind:this={self}
  class="slide-mark"
  class:on={group.shown && !!group.rect}
  style:left="{off.x}px"
  style:top="{off.y}px"
  style:width={group.rect ? `${group.rect.w}px` : "0px"}
  style:height={group.rect ? `${group.rect.h}px` : "0px"}
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
</style>
