<script lang="ts">
  let { size = 28 }: { size?: number } = $props();
</script>

<!-- A card whose highlighting is swept across on hover (the accent is ours,
     drawn from the same token as links, so it never becomes decoration). -->
<svg
  class="icon"
  width={size}
  height={size}
  viewBox="0 0 28 28"
  fill="none"
  aria-hidden="true"
  focusable="false"
>
  <rect class="card" x="5" y="5.5" width="18" height="17" rx="2.5" />
  <rect class="wash" x="6" y="13.3" width="16" height="3.3" rx="1.4" />
  <path class="word" d="M8.5 11.4h8M8.5 15h11" />
  <path class="word word-short" d="M8.5 18.6h6" />
</svg>

<style>
  .icon {
    color: var(--ink);
    overflow: visible;
  }

  .card {
    stroke: currentColor;
    stroke-width: 1.5;
    opacity: 0.5;
  }

  .wash {
    fill: var(--accent);
    opacity: 0.16;
    transform: scaleX(0);
    transform-origin: 5px 50%;
    transition: transform var(--dur-2) var(--ease);
  }

  .word {
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    opacity: 0.55;
    transition: opacity var(--dur-2) var(--ease);
  }

  :global(.feature:hover) .wash {
    transform: scaleX(1);
  }

  :global(.feature:hover) .word {
    opacity: 0.9;
  }
</style>
