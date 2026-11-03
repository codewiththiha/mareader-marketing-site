<script lang="ts">
  import { untrack } from "svelte";
  import { styles } from "@/lib/style";

  interface Line {
    key: number;
    text: string;
  }

  let { text }: { text: string } = $props();

  let shown = $state<Line[]>([{ key: 0, text: untrack(() => text) }]);
  let keys = 0;

  $effect(() => {
    const next = text;
    const seen = untrack(() => shown);
    const last = seen[seen.length - 1];
    if (last?.text === next) return;
    keys += 1;
    shown = [...seen.slice(-1), { key: keys, text: next }];
  });

  $effect(() => {
    const lines = shown;
    if (lines.length < 2) return;
    const id = setTimeout(() => {
      shown = shown.slice(-1);
    }, 320);
    return () => {
      clearTimeout(id);
    };
  });
</script>

<div class="relative mt-5 min-h-[3.4em] text-[15px] leading-[1.5] sm:min-h-[2.6em] sm:text-[16px]" aria-live="polite">
  {#each shown as line, i (line.key)}
    <p
      class="absolute inset-x-0 top-0 mx-auto max-w-[62ch] text-center text-balance {i === shown.length - 1 ? 'caption-in' : 'caption-out'}"
      style={styles({ color: "var(--ink)" })}
    >
      {line.text}
    </p>
  {/each}
</div>
