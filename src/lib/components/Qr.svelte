<script lang="ts">
  // Qr — styled QR: pill modules, ring eyes, a mark in the middle
  import qrcode from "qrcode-generator";
  import type { Snippet } from "svelte";

  let {
    value,
    size = 176,
    ec = "Q",
    label = "QR code for this address",
    center
  }: {
    value: string;
    size?: number;
    ec?: "L" | "M" | "Q" | "H";
    label?: string;
    center?: Snippet;
  } = $props();

  interface Rect {
    x: number;
    y: number;
    w: number;
  }
  interface Model {
    n: number;
    rects: Rect[];
    eyes: [number, number][];
  }

  function build(text: string, level: "L" | "M" | "Q" | "H"): Model {
    const qr = qrcode(0, level);
    qr.addData(text, "Byte");
    qr.make();
    const n = qr.getModuleCount();
    const inFinder = (r: number, c: number) =>
      (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8);
    const rects: Rect[] = [];
    for (let r = 0; r < n; r++) {
      let c = 0;
      while (c < n) {
        if (qr.isDark(r, c) && !inFinder(r, c)) {
          let w = 1;
          while (c + w < n && qr.isDark(r, c + w) && !inFinder(r, c + w)) w++;
          rects.push({ x: c, y: r, w });
          c += w;
        } else {
          c++;
        }
      }
    }
    return {
      n,
      rects,
      eyes: [
        [0, 0],
        [n - 7, 0],
        [0, n - 7]
      ]
    };
  }

  let model = $derived(build(value, ec));
  let view = $derived(-2.6);
  let span = $derived(model.n + 5.2);
</script>

<div class="qr" style="width:{size}px;height:{size}px">
  <svg
    viewBox="{view} {view} {span} {span}"
    width={size}
    height={size}
    role="img"
    aria-label={label}
  >
    <g fill="currentColor" shape-rendering="geometricPrecision">
      {#each model.rects as r (r.y * model.n + r.x)}
        <rect x={r.x} y={r.y} width={r.w} height="1" rx="0.5"></rect>
      {/each}
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1">
      {#each model.eyes as [ex, ey] (ex * 100 + ey)}
        <rect x={ex + 0.5} y={ey + 0.5} width="6" height="6" rx="1.8"></rect>
      {/each}
    </g>
    <g fill="currentColor">
      {#each model.eyes as [ex, ey] (ex * 100 + ey + 1)}
        <rect x={ex + 2.05} y={ey + 2.05} width="2.9" height="2.9" rx="1"></rect>
      {/each}
    </g>
  </svg>
  {#if center}
    <span class="qr-center">{@render center()}</span>
  {/if}
  <span class="qr-scan" aria-hidden="true"></span>
</div>
