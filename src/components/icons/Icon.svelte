<script lang="ts" module>
  /** Utility glyphs. Feature icons live in their own files, animated. */
  export type GlyphName =
    | 'arrow-right'
    | 'arrow-down'
    | 'arrow-up-right'
    | 'check'
    | 'copy'
    | 'github'
    | 'menu'
    | 'close'
    | 'chevron-down';
</script>

<script lang="ts">
  interface Props {
    name: GlyphName;
    size?: number;
    /** Keep the optical weight right at small sizes. */
    stroke?: number;
  }
  let { name, size = 16, stroke = 1.6 }: Props = $props();
</script>

<svg
  class="glyph"
  width={size}
  height={size}
  style:--glyph-stroke={stroke}
  viewBox="0 0 24 24"
  fill="none"
  aria-hidden="true"
  focusable="false"
>
  {#if name === 'arrow-right'}
    <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" />
  {:else if name === 'arrow-down'}
    <path d="M12 4v15m0 0 5.5-5.5M12 19l-5.5-5.5" />
  {:else if name === 'arrow-up-right'}
    <path d="M7 17 17 7m0 0H9m8 0v8" />
  {:else if name === 'check'}
    <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
  {:else if name === 'copy'}
    <rect x="9" y="9" width="11" height="11" rx="2.2" />
    <path d="M15 5.6A2.2 2.2 0 0 0 12.8 4H6.2A2.2 2.2 0 0 0 4 6.2v6.6A2.2 2.2 0 0 0 5.6 15" />
  {:else if name === 'github'}
    <path
      fill="currentColor"
      stroke="none"
      d="M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.5.1.7-.2.7-.5v-1.8c-2.7.6-3.3-1.3-3.3-1.3-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.2-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.2-.4-1.2.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.6.6.7 1 1.6 1 2.7 0 3.8-2.3 4.7-4.5 4.9.3.3.7 1 .7 2v2.9c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2Z"
    />
  {:else if name === 'menu'}
    <path d="M4 7h16M4 12h16M4 17h10" />
  {:else if name === 'close'}
    <path d="M6 6l12 12M18 6 6 18" />
  {:else if name === 'chevron-down'}
    <path d="m6 9.5 6 6 6-6" />
  {/if}
</svg>

<style>
  .glyph {
    stroke: currentColor;
    stroke-width: var(--glyph-stroke, 1.6);
    stroke-linecap: round;
    stroke-linejoin: round;
    flex: none;
  }
</style>
