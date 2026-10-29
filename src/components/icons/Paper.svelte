<script lang="ts">
  let { size = 28 }: { size?: number } = $props();
</script>

<!-- A page whose ink lines draw themselves in under the pointer. -->
<svg
  class="icon"
  width={size}
  height={size}
  viewBox="0 0 28 28"
  fill="none"
  aria-hidden="true"
  focusable="false"
>
  <path class="sheet" d="M6 3.5h11l5 5v16H6v-21Z" />
  <path class="fold" d="M17 3.5v5h5" />
  <path class="line line-a" d="M9.5 13h9" />
  <path class="line line-b" d="M9.5 16.5h9" />
  <path class="line line-c" d="M9.5 20h5" />
</svg>

<style>
  .icon {
    color: var(--ink);
    overflow: visible;
  }

  .sheet,
  .fold {
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linejoin: round;
  }

  .fold {
    opacity: 0.5;
  }

  .line {
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-dasharray: 10;
    stroke-dashoffset: 0;
    transition: stroke-dashoffset var(--dur-2) var(--ease);
    opacity: 0.55;
  }

  :global(.feature:hover) .line {
    animation: draw var(--dur-2) var(--ease) both;
  }

  :global(.feature:hover) .line-b {
    animation-delay: 60ms;
  }

  :global(.feature:hover) .line-c {
    animation-delay: 120ms;
  }

  @keyframes draw {
    from {
      stroke-dashoffset: 10;
      opacity: 0.2;
    }
    to {
      stroke-dashoffset: 0;
      opacity: 0.9;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.feature:hover) .line {
      animation: none;
      opacity: 0.9;
    }
  }
</style>
