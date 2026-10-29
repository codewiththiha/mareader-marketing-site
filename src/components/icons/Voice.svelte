<script lang="ts">
  let { size = 28 }: { size?: number } = $props();
</script>

<!-- Speech with its words rising: read-along. -->
<svg
  class="icon"
  width={size}
  height={size}
  viewBox="0 0 28 28"
  fill="none"
  aria-hidden="true"
  focusable="false"
>
  <path
    class="bubble"
    d="M4.5 8.5A3.5 3.5 0 0 1 8 5h12a3.5 3.5 0 0 1 3.5 3.5v7A3.5 3.5 0 0 1 20 19h-3l-4.5 4v-4H8a3.5 3.5 0 0 1-3.5-3.5v-7Z"
  />
  <path class="bar bar-a" d="M10 12.5v3" />
  <path class="bar bar-b" d="M14 9.5v9" />
  <path class="bar bar-c" d="M18 11.5v5" />
</svg>

<style>
  .icon {
    color: var(--ink);
    overflow: visible;
  }

  .bubble {
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linejoin: round;
    opacity: 0.5;
  }

  .bar {
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    transform-origin: 50% 50%;
    transition: transform var(--dur-2) var(--ease);
  }

  /* Hover runs a short wave through the three bars, once, then settles. */
  :global(.feature:hover) .bar {
    animation: word 620ms var(--ease) 2;
  }

  :global(.feature:hover) .bar-b {
    animation-delay: 90ms;
  }

  :global(.feature:hover) .bar-c {
    animation-delay: 180ms;
  }

  @keyframes word {
    0%,
    100% {
      transform: scaleY(1);
      opacity: 0.75;
    }
    40% {
      transform: scaleY(1.55);
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.feature:hover) .bar {
      animation: none;
      opacity: 1;
    }
  }
</style>
