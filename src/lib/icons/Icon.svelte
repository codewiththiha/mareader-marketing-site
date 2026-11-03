<script lang="ts">
  import type { IconNode } from "./nodes";

  let {
    node,
    size = 24,
    strokeWidth = 2,
    fill = "none",
    style,
    ariaHidden = false,
    class: cls,
  }: {
    node: IconNode;
    size?: number;
    strokeWidth?: number;
    fill?: string;
    style?: string;
    ariaHidden?: boolean;
    class?: string;
  } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  {fill}
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden={ariaHidden ? "true" : undefined}
  {style}
  class={cls}
>
  {#each node as [tag, attrs], ni (ni)}
    <svelte:element this={tag} {...attrs} />
  {/each}
</svg>
