<script lang="ts">
  let { size = 28 }: { size?: number } = $props();
</script>

<!-- One page becomes two under the pointer: the feature, drawn. -->
<svg
  class="icon"
  width={size}
  height={size}
  viewBox="0 0 28 28"
  fill="none"
  aria-hidden="true"
  focusable="false"
>
  <rect class="frame" x="3.5" y="4.5" width="21" height="19" rx="3" />
  <path class="divider" d="M14 4.5v19" />
  <rect class="half" x="6.5" y="8" width="4.5" height="1.6" rx="0.8" />
  <rect class="half" x="17" y="8" width="4.5" height="1.6" rx="0.8" />
  <rect class="half" x="6.5" y="12.5" width="4.5" height="1.6" rx="0.8" />
  <rect class="half" x="17" y="12.5" width="4.5" height="1.6" rx="0.8" />
</svg>

<style>
  .icon {
    color: var(--ink);
    overflow: visible;
  }

  .frame {
    stroke: currentColor;
    stroke-width: 1.5;
    transition: transform var(--dur-2) var(--ease);
    transform-origin: 50% 50%;
  }

  .divider {
    stroke: currentColor;
    stroke-width: 1.5;
    opacity: 0.45;
    transition: opacity var(--dur-2) var(--ease);
  }

  .half {
    fill: currentColor;
    opacity: 0.55;
    transition:
      transform var(--dur-2) var(--ease),
      opacity var(--dur-2) var(--ease);
  }

  :global(.feature:hover) .frame {
    transform: scaleX(1.06);
  }

  :global(.feature:hover) .divider {
    opacity: 1;
  }

  :global(.feature:hover) .half:first-of-type {
    transform: translateX(-1.5px);
    opacity: 0.9;
  }

  :global(.feature:hover) .half:nth-of-type(2) {
    transform: translateX(1.5px);
    opacity: 0.9;
  }

  :global(.feature:hover) .half:nth-of-type(3) {
    transform: translateX(-1.5px);
    opacity: 0.9;
  }

  :global(.feature:hover) .half:nth-of-type(4) {
    transform: translateX(1.5px);
    opacity: 0.9;
  }
</style>
