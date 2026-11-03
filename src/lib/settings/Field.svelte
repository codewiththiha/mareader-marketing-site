<script lang="ts">
  import { styles } from "@/lib/style";

  let {
    value,
    hint,
    password = false,
    style = "",
    focus,
  }: { value: string; hint?: string; password?: boolean; style?: string; focus?: string } = $props();
  const shown = $derived(value ? (password ? "•".repeat(Math.min(28, value.length)) : value) : hint);
</script>

<span
  data-focus={focus}
  class="inline-flex items-center truncate"
  style={styles(
    {
      height: 26,
      padding: "0 8px",
      fontSize: 12,
      borderRadius: 7,
      background: "var(--paper)",
      border: "1px solid var(--line)",
      color: value ? "var(--ink)" : "var(--muted)",
      letterSpacing: password && value ? "0.12em" : undefined,
    },
    style,
  )}>{shown}</span
>
