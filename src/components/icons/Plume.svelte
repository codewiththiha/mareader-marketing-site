<script lang="ts">
  let { size = 28 }: { size?: number } = $props();
</script>

<!-- A quill: native code, drawn by hand. The nib draws itself in on hover. -->
<svg
  class="icon"
  width={size}
  height={size}
  viewBox="0 0 28 28"
  fill="none"
  aria-hidden="true"
  focusable="false"
>
  <path class="shaft" d="M23 5c-.6 6-3.2 10.6-7.6 13.6-1.9 1.3-4 2.1-6.2 2.4" />
  <path class="nib" d="M9.2 21c-.2-2.4.4-4.6 1.8-6.6 2.2.2 4 .9 5.4 2.2-1.4 2-3.8 3.4-7.2 4.4Z" />
  <path class="tick" d="M4.8 23.2 8 20" />
</svg>

<style>
  .icon {
    color: var(--ink);
    overflow: visible;
  }

  .shaft,
  .nib,
  .tick {
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .shaft {
    opacity: 0.55;
  }

  .nib {
    stroke-dasharray: 22;
    stroke-dashoffset: 0;
    transition: stroke-dashoffset var(--dur-2) var(--ease);
  }

  :global(.feature:hover) .nib {
    animation: nib 620ms var(--ease) both;
  }

  @keyframes nib {
    from {
      stroke-dashoffset: 22;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.feature:hover) .nib {
      animation: none;
    }
  }
</style>
