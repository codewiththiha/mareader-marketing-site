<script lang="ts">
  import type { LucideIcon } from "@lucide/svelte";
  import { styles } from "@/lib/style";

  interface Segment {
    id: string;
    label: string;
    icon?: LucideIcon;
  }

  let { value, options, focus, height = 28 }: { value: string; options: Segment[]; focus?: string; height?: number } = $props();
</script>

<div
  data-focus={focus}
  class="flex w-full"
  style={styles({ height, borderRadius: 8, padding: 2, background: "color-mix(in srgb, var(--line) 55%, transparent)" })}
>
  {#each options as o (o.id)}
    {@const on = o.id === value}
    {@const Icon = o.icon}
    <div
      class="flex flex-1 items-center justify-center gap-1.5 truncate"
      style={styles({
        borderRadius: 6,
        fontSize: 12,
        fontWeight: on ? 500 : 400,
        color: on ? "var(--accent)" : "var(--ink)",
        background: on ? "var(--accent-soft)" : "transparent",
      })}
    >
      {#if Icon}
        <Icon size={13} strokeWidth={2} />
      {/if}
      <span class="truncate">{o.label}</span>
    </div>
  {/each}
</div>
