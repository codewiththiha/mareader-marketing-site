<script lang="ts">
  import type { Snippet } from "svelte";
  import { styles } from "@/lib/style";

  let {
    children,
    primary = false,
    small = false,
    focus,
  }: { children: Snippet; primary?: boolean; small?: boolean; focus?: string } = $props();
</script>

<span
  data-focus={focus}
  class="inline-flex shrink-0 items-center justify-center"
  style={styles({
    height: small ? 24 : 28,
    padding: small ? "0 8px" : "0 10px",
    gap: 6,
    fontSize: small ? 12 : 13,
    borderRadius: 8,
    background: primary ? "var(--accent)" : "var(--paper)",
    color: primary ? "var(--ink-on-accent)" : "var(--ink)",
    border: primary ? "1px solid transparent" : "1px solid var(--line)",
  })}
>
  {@render children()}
</span>
