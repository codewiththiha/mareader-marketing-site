<script lang="ts">
  import { styles } from "@/lib/style";
  import type { LucideIcon } from "@lucide/svelte";

  let {
    icon: Icon,
    pressed = false,
    size = 36,
    iconSize = 18,
    focus,
    label,
  }: {
    icon: LucideIcon;
    pressed?: boolean;
    size?: number;
    iconSize?: number;
    focus?: string;
    label?: string;
  } = $props();
</script>

<div
  data-focus={focus}
  aria-label={label}
  class="flex shrink-0 items-center justify-center"
  style={styles({
    width: size,
    height: size,
    borderRadius: 8,
    background: pressed ? "var(--accent-soft)" : "transparent",
    color: pressed ? "var(--accent)" : "var(--ink)",
  })}
>
  <Icon size={iconSize} strokeWidth={2} />
</div>
