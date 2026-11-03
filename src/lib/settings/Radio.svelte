<script lang="ts">
  import { styles } from "@/lib/style";

  let { on }: { on: boolean } = $props();
</script>

<span
  class="flex shrink-0 items-center justify-center rounded-full"
  style={styles({
    width: 16,
    height: 16,
    border: on ? "none" : "1.5px solid var(--muted)",
    background: on ? "var(--accent)" : "transparent",
  })}
>
  {#if on}
    <span class="rounded-full" style={styles({ width: 6, height: 6, background: "var(--ink-on-accent)" })}></span>
  {/if}
</span>
