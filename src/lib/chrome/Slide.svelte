<script lang="ts">
  import type { SlideGroup } from "$lib/utils/slide.svelte";

  let { group, radius = 10 }: { group: SlideGroup; radius?: number } = $props();
</script>

<span
  class="slide-mark"
  class:on={group.shown && !!group.rect}
  style:left={group.rect ? `${group.rect.x}px` : "0px"}
  style:top={group.rect ? `${group.rect.y}px` : "0px"}
  style:width={group.rect ? `${group.rect.w}px` : "0px"}
  style:height={group.rect ? `${group.rect.h}px` : "0px"}
  style:border-radius="{radius}px"
  aria-hidden="true"
></span>

<style>
  .slide-mark {
    position: absolute;
    left: 0;
    top: 0;
    background: color-mix(in srgb, var(--ink) 7%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink) 12%, transparent);
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
