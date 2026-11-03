<script lang="ts">
  import { styles } from "@/lib/style";

  let { value, min, max, shown, focus }: { value: number; min: number; max: number; shown: string; focus?: string } = $props();
  const p = $derived(Math.min(1, Math.max(0, (value - min) / (max - min))));
  const fill = $derived(`${p * 100}%`);
</script>

<div data-focus={focus} class="flex flex-1 items-center gap-2" style={styles({ height: 20 })}>
  <div class="relative flex-1" style={styles({ height: 4, borderRadius: 2, background: "var(--line)" })}>
    <div
      class="absolute inset-y-0 left-0"
      style={styles({ width: fill, borderRadius: 2, background: "var(--accent)", transition: "width 0.12s linear" })}
    ></div>
    <span
      class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={styles({
        left: fill,
        width: 14,
        height: 14,
        background: "var(--paper)",
        boxShadow: "0 0 0 1px var(--line), 0 1px 3px rgba(0,0,0,.25)",
        transition: "left 0.12s linear",
      })}
    ></span>
  </div>
  <span
    class="flex shrink-0 items-center justify-center tabular-nums"
    style={styles({
      width: 52,
      height: 20,
      fontSize: 11,
      borderRadius: 6,
      border: "1px solid var(--line)",
      color: "var(--ink)",
      background: "var(--paper)",
    })}
  >
    {shown}
  </span>
</div>
