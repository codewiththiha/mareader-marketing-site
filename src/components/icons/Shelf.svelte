<script lang="ts">
  let { size = 28 }: { size?: number } = $props();
</script>

<!-- Books on a shelf; the middle one leans out as it is pointed at. -->
<svg
  class="icon"
  width={size}
  height={size}
  viewBox="0 0 28 28"
  fill="none"
  aria-hidden="true"
  focusable="false"
>
  <path class="board" d="M4.5 22.5h19" />
  <rect class="spine spine-a" x="6" y="8.5" width="4" height="12" rx="1.2" />
  <rect class="spine spine-b" x="11.5" y="6" width="4" height="14.5" rx="1.2" />
  <rect class="spine spine-c" x="17" y="9.5" width="4" height="11" rx="1.2" />
</svg>

<style>
  .icon {
    color: var(--ink);
    overflow: visible;
  }

  .board {
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    opacity: 0.45;
  }

  .spine {
    stroke: currentColor;
    stroke-width: 1.5;
    fill: currentColor;
    fill-opacity: 0.12;
    transition: transform var(--dur-2) var(--ease);
    transform-origin: 50% 100%;
  }

  :global(.feature:hover) .spine-b {
    transform: translateY(-2.5px) rotate(-4deg);
  }

  :global(.feature:hover) .spine-a {
    transform: translateX(-1px);
  }

  :global(.feature:hover) .spine-c {
    transform: translateX(1px);
  }
</style>
