<script lang="ts">
  import type { Snippet } from "svelte";
  import { styles } from "@/lib/style";

  let { tone = "soft", children }: { tone?: "soft" | "accent"; children: Snippet } = $props();
</script>

<span
  style={styles({
    fontSize: 11,
    padding: "2px 7px",
    borderRadius: 7,
    background: tone === "accent" ? "var(--accent)" : "var(--accent-soft)",
    color: tone === "accent" ? "var(--ink-on-accent)" : "var(--ink)",
  })}
>
  {@render children()}
</span>
