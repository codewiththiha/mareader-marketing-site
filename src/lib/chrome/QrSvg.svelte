<script lang="ts">
  import { encode } from "uqr";

  /** The address as a quiet-zone QR, drawn in the theme's own ink. */
  let { text, border = 2 }: { text: string; border?: number } = $props();
  const qr = $derived(encode(text));
  const cells = $derived.by(() => {
    const out: [number, number][] = [];
    for (let r = 0; r < qr.size; r++) for (let c = 0; c < qr.size; c++) if (qr.data[r][c]) out.push([r, c]);
    return out;
  });
  const side = $derived(qr.size + border * 2);
</script>

<svg viewBox="0 0 {side} {side}" role="img" aria-label="Payment address QR code">
  {#each cells as cell (cell[0] * qr.size + cell[1])}
    <rect x={cell[1] + border} y={cell[0] + border} width="1" height="1" rx="0.22" />
  {/each}
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    height: auto;
    fill: currentColor;
  }
</style>
