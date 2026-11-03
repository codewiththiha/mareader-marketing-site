<script lang="ts">
  /** Copy glyph whose sheet folds into a check once the address lands. */
  let { done = false }: { done?: boolean } = $props();
</script>

<svg
  viewBox="0 0 24 24"
  width="17"
  height="17"
  fill="none"
  stroke="currentColor"
  stroke-width="1.9"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <g class="sheets" class:done>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2.4" />
    <path d="M15.5 5.5h-9a2.4 2.4 0 0 0-2.4 2.4v9" />
  </g>
  <path class="tick" class:done pathLength="1" d="m5.5 12.8 4 4 9-9.5" />
</svg>

<style>
  .sheets,
  .tick {
    transition:
      opacity 0.25s ease,
      transform 0.35s var(--e-pane);
    transform-origin: 12px 12px;
  }
  .tick {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    opacity: 0;
  }
  .sheets.done {
    opacity: 0;
    transform: scale(0.7) rotate(-8deg);
  }
  .tick.done {
    stroke-dashoffset: 0;
    opacity: 1;
  }
</style>
