<script lang="ts">
  /**
   * The app's own mark, from `apps/mareader/icons/logo.svg` in mareader2: an
   * onyx tile with an ivory book, gilt edges and a ribbon. Inline rather than an
   * <img> so it survives a preview with no network and no extra request.
   */
  import mark from '../assets/brand/logo.svg?raw';

  interface Props {
    size?: number;
  }

  let { size = 24 }: Props = $props();
</script>

<span class="mark" style:width="{size}px" style:height="{size}px" aria-hidden="true">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- our own file, read at build time -->
  {@html mark}
</span>

<style>
  .mark {
    display: inline-block;
    flex: none;
    line-height: 0;
  }

  /* The SVG carries its own viewBox and gradients; let it fill the box. */
  .mark :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
