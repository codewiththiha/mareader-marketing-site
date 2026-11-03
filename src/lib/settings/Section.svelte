<script lang="ts">
  import type { Snippet } from "svelte";
  import { styles } from "@/lib/style";

  let { title, children }: { title: string; children: Snippet } = $props();
</script>

<div style={styles({ marginBottom: 14 })}>
  <div style={styles({ fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 6 })}>{title}</div>
  <div
    class="flex flex-col overflow-hidden"
    style={styles({ borderRadius: 10, background: "var(--card)", border: "1px solid var(--line)" })}
  >
    {@render children()}
  </div>
</div>
