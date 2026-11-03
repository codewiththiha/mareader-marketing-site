<script lang="ts">
  import type { Snippet } from "svelte";
  import { styles } from "@/lib/style";

  let { name, children }: { name: string; children: Snippet } = $props();
</script>

<div class="flex items-center" style={styles({ minHeight: 20, gap: 8 })}>
  <span style={styles({ width: 64, fontSize: 12, color: "var(--muted)", flexShrink: 0 })}>{name}</span>
  {@render children()}
</div>
