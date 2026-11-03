<script lang="ts">
  import type { Snippet } from "svelte";
  import { styles } from "@/lib/style";
  import { untrack } from "svelte";
  import type { StageView } from "@/lib/scene.svelte";
  import Caption from "@/lib/stage/Caption.svelte";

  interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
    r: number;
  }

  let { scene, children, ring = true }: { scene: StageView; children?: Snippet; ring?: boolean } = $props();

  let zoomer = $state<HTMLDivElement | undefined>();
  let box = $state<Box | null>(null);

  const design = $derived(scene.design);
  const fit = $derived(scene.fit);
  const zoom = $derived(scene.focus ? scene.zoom * (scene.compact ? 1.25 : 1) : 1);

  const transform = $derived.by(() => {
    if (!box || zoom <= 1) return "translate(0px, 0px) scale(1)";
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const s = zoom;
    const tx = Math.min(0, Math.max(design.w - design.w * s, design.w / 2 - cx * s));
    const ty = Math.min(0, Math.max(design.h - design.h * s, design.h / 2 - cy * s));
    return `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s})`;
  });

  const focused = $derived(Boolean(box) && Boolean(scene.focus));

  const ringStyle = $derived(
    styles({
      left: (box?.x ?? design.w / 2) - 5,
      top: (box?.y ?? design.h / 2) - 5,
      width: (box?.w ?? 0) + 10,
      height: (box?.h ?? 0) + 10,
      borderRadius: (box?.r ?? 8) + 5,
      opacity: focused ? 1 : 0,
      boxShadow:
        "0 0 0 1.5px var(--accent), 0 0 0 6px color-mix(in srgb, var(--accent) 16%, transparent), 0 0 24px color-mix(in srgb, var(--accent) 25%, transparent)",
      transition: focused
        ? "left 0.6s var(--ease-out-quint), top 0.6s var(--ease-out-quint), width 0.6s var(--ease-out-quint), height 0.6s var(--ease-out-quint), opacity 0.35s ease"
        : "opacity 0.3s ease",
    }),
  );

  $effect(() => {
    const focus = scene.focus;
    const step = scene.index;
    const width = design.w;
    const host = zoomer;
    if (!host || !focus || step < 0) {
      box = null;
      return;
    }
    const measure = () => {
      const el = host.querySelector<HTMLElement>(`[data-focus="${focus}"]`);
      if (!el) {
        box = null;
        return;
      }
      const zr = host.getBoundingClientRect();
      const s = zr.width / width || 1;
      const er = el.getBoundingClientRect();
      const next: Box = {
        x: (er.left - zr.left) / s,
        y: (er.top - zr.top) / s,
        w: er.width / s,
        h: er.height / s,
        r: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0,
      };
      const seen = untrack(() => box);
      const settled =
        seen !== null &&
        Math.abs(seen.x - next.x) < 1.5 &&
        Math.abs(seen.y - next.y) < 1.5 &&
        Math.abs(seen.w - next.w) < 1.5 &&
        Math.abs(seen.h - next.h) < 1.5;
      if (!settled) box = next;
    };
    const raf = requestAnimationFrame(measure);
    const timer = window.setInterval(measure, 140);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
    };
  });
</script>

<div class="flex flex-col">
  <div
    use:scene.attach
    class="relative w-full overflow-hidden rounded-[14px]"
    style={styles({
      height: design.h * fit,
      background: "var(--surface)",
      boxShadow: "0 0 0 1px var(--line), 0 24px 60px -24px rgba(0,0,0,0.35)",
    })}
  >
    <div
      class="absolute top-0 left-0"
      style={styles({ width: design.w, height: design.h, transform: `scale(${fit})`, transformOrigin: "0 0" })}
    >
      <div
        bind:this={zoomer}
        class="zoomer relative"
        style={styles({
          width: design.w,
          height: design.h,
          transform,
          transformOrigin: "0 0",
          transition: "transform 1.05s cubic-bezier(0.22, 1, 0.36, 1)",
        })}
      >
        {@render children?.()}
        {#if ring}
          <div class="pointer-events-none absolute z-[60]" style={ringStyle}></div>
        {/if}
      </div>
    </div>
  </div>
  <Caption text={scene.caption} />
</div>
