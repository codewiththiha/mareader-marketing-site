<script lang="ts">
  import type { Snippet } from "svelte";
  import { styles } from "@/lib/style";

  let { focus, style = "", open = false, children }: { focus?: string; style?: string; open?: boolean; children: Snippet } = $props();
</script>

<div
  data-focus={focus}
  class="flex items-center"
  style={styles(
    {
      minHeight: 40,
      padding: "7px 12px",
      gap: 10,
      fontSize: 13,
      borderTop: "1px solid var(--line)",
      background: open ? "color-mix(in srgb, var(--accent-soft) 35%, transparent)" : undefined,
    },
    style,
  )}
>
  {@render children()}
</div>
