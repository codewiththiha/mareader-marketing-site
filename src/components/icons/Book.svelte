<script lang="ts">
  interface Props {
    size?: number;
  }
  let { size = 26 }: Props = $props();
</script>

<!-- Marks a group of features, not a feature itself. -->
<svg
  class="mark"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  aria-hidden="true"
  focusable="false"
>
  <path
    class="cover"
    d="M4 4.8c2.6-.9 5.2-.9 8 0v14.4c-2.8-.9-5.4-.9-8 0V4.8Z"
    fill="currentColor"
    opacity="0.14"
  />
  <path
    class="cover"
    d="M20 4.8c-2.6-.9-5.2-.9-8 0v14.4c2.8-.9 5.4-.9 8 0V4.8Z"
    fill="currentColor"
    opacity="0.14"
  />
  <path class="edge" d="M4 4.8c2.6-.9 5.2-.9 8 0v14.4c-2.8-.9-5.4-.9-8 0V4.8Z" />
  <path class="edge" d="M20 4.8c-2.6-.9-5.2-.9-8 0v14.4c2.8-.9 5.4-.9 8 0V4.8Z" />
  <path
    class="ribbon"
    d="M12 6.4v9.2"
    stroke="var(--gilt)"
    stroke-width="1.4"
    stroke-linecap="round"
  />
</svg>

<style>
  .mark {
    color: var(--ink);
    overflow: visible;
  }

  .edge {
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linejoin: round;
    transform-origin: 50% 88%;
    transition: transform var(--dur-2) var(--ease);
  }

  .cover {
    transform-origin: 50% 88%;
    transition: transform var(--dur-2) var(--ease);
  }

  .ribbon {
    transition: transform var(--dur-2) var(--ease);
  }

  /* The book opens a few degrees under the pointer, no more. */
  :global(a:hover) .mark .edge:first-of-type,
  :global(a:hover) .mark .cover:first-of-type {
    transform: rotate(-3deg);
  }

  :global(a:hover) .mark .edge:last-of-type,
  :global(a:hover) .mark .cover:last-of-type {
    transform: rotate(3deg);
  }

  :global(a:hover) .mark .ribbon {
    transform: translateY(1px);
  }
</style>
