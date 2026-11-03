<script lang="ts">
  /** Sun and moon as one control: rays retract while the crescent rolls in. */
  let { dark = false }: { dark?: boolean } = $props();
</script>

<svg
  viewBox="0 0 24 24"
  width="18"
  height="18"
  fill="none"
  stroke="currentColor"
  stroke-width="1.9"
  stroke-linecap="round"
  aria-hidden="true"
>
  <g class="sun" class:off={dark}>
    <circle cx="12" cy="12" r="4.2" />
    {#each [0, 45, 90, 135, 180, 225, 270, 315] as a (a)}
      <line x1="12" y1="2.8" x2="12" y2="4.8" transform="rotate({a} 12 12)" />
    {/each}
  </g>
  <path class="moon" class:on={dark} d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
</svg>

<style>
  svg {
    overflow: visible;
  }
  .sun,
  .moon {
    transition:
      transform 0.45s var(--e-pane),
      opacity 0.25s ease;
    transform-origin: 12px 12px;
  }
  .sun.off {
    opacity: 0;
    transform: rotate(70deg) scale(0.55);
  }
  .moon {
    opacity: 0;
    transform: rotate(-70deg) scale(0.55);
  }
  .moon.on {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
</style>
