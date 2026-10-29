<script lang="ts">
  /**
   * Paper, drawn once into a canvas at the element's own size. Not an animated
   * background: it redraws on a texture change, a resize or a theme change, and
   * costs nothing in between. docs/design.md § Texture.
   */
  import { theme } from '../lib/theme.svelte';
  import type { TextureKind } from '../lib/appearance';

  interface Props {
    kind: TextureKind;
    /** Pattern scale, 0.6–1.6. */
    scale?: number;
  }

  let { kind, scale = 1 }: Props = $props();

  let host = $state<HTMLDivElement | null>(null);
  let canvas = $state<HTMLCanvasElement | null>(null);

  /** Seeded noise: the same paper on every visit. */
  function random(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function draw(): void {
    if (!host || !canvas) return;
    const box = host.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(box.width * dpr);
    canvas.height = Math.round(box.height * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, box.width, box.height);
    ctx.strokeStyle = getComputedStyle(canvas).color;
    ctx.fillStyle = ctx.strokeStyle;

    const step = 14 * scale;

    if (kind === 'paper') {
      const next = random(0x9e3779b9);
      const count = Math.round((box.width * box.height) / 900);
      for (let i = 0; i < count; i += 1) {
        const x = next() * box.width;
        const y = next() * box.height;
        const length = 1 + next() * 5 * scale;
        ctx.globalAlpha = 0.05 + next() * 0.1;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + length, y + (next() - 0.5) * 1.4);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      return;
    }

    ctx.globalAlpha = 0.14;
    ctx.lineWidth = 0.7;

    if (kind === 'lined') {
      for (let y = step; y < box.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(box.width, y + 0.5);
        ctx.stroke();
      }
    } else if (kind === 'grid') {
      for (let x = step; x < box.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, box.height);
        ctx.stroke();
      }
      for (let y = step; y < box.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(box.width, y + 0.5);
        ctx.stroke();
      }
    } else {
      for (let y = step / 2; y < box.height; y += step) {
        for (let x = step / 2; x < box.width; x += step) {
          ctx.beginPath();
          ctx.arc(x, y, 0.9 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  $effect(() => {
    // Reading these makes the effect rerun when any of them changes.
    void kind;
    void scale;
    void theme.resolved;
    draw();
  });

  $effect(() => {
    if (!host) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(host);
    return () => observer.disconnect();
  });
</script>

<div class="texture" bind:this={host} aria-hidden="true">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .texture {
    position: absolute;
    inset: 0;
    color: var(--page-ink);
    pointer-events: none;
    opacity: 0.9;
  }

  canvas {
    width: 100%;
    height: 100%;
  }
</style>
