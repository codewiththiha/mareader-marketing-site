<script lang="ts">
  import { buildQr } from '../lib/qr';

  interface Props {
    value: string;
    /** Widest the code may be drawn, in CSS pixels. */
    size?: number;
    /** What the code encodes, for screen readers. */
    label: string;
  }

  let { value, size = 208, label }: Props = $props();
  const drawing = $derived(buildQr(value));
</script>

<svg
  class="qr"
  style:max-width="{size}px"
  viewBox="0 0 {drawing.extent} {drawing.extent}"
  role="img"
  aria-label={label}
>
  <rect width={drawing.extent} height={drawing.extent} fill="var(--qr-paper)" />
  <path d={drawing.dots} fill="var(--qr-ink)" />
  {#each drawing.finders as finder (finder.x + ':' + finder.y)}
    <rect
      x={finder.x + 0.5}
      y={finder.y + 0.5}
      width="6"
      height="6"
      rx="1.7"
      fill="none"
      stroke="var(--qr-ink)"
      stroke-width="1"
    />
    <rect x={finder.x + 2} y={finder.y + 2} width="3" height="3" rx="0.9" fill="var(--qr-ink)" />
  {/each}
</svg>

<style>
  .qr {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    border-radius: 10px;
    outline: 1px solid var(--line);
    user-select: none;
    --qr-paper: var(--paper-raised);
    --qr-ink: var(--ink);
  }
</style>
