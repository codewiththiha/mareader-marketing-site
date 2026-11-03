<script lang="ts">
  import type { Snippet } from "svelte";
  import { ChevronDown, ChevronRight } from "@lucide/svelte";
  import { styles } from "@/lib/style";

  let { title, summary, open, trailing }: { title: string; summary?: string; open: boolean; trailing?: Snippet } = $props();
</script>

<div class="flex items-center" style={styles({ height: 24, fontSize: 12, color: "var(--ink)" })}>
  {#if open}
    <ChevronDown size={12} strokeWidth={2} style="color:var(--muted);margin-right:6px" />
  {:else}
    <ChevronRight size={12} strokeWidth={2} style="color:var(--muted);margin-right:6px" />
  {/if}
  <span>{title}</span>
  {#if !open && summary}
    <span class="ml-auto truncate" style={styles({ color: "var(--muted)", maxWidth: 180 })}>{summary}</span>
  {/if}
  {#if trailing}
    <span class="ml-auto">
      {@render trailing()}
    </span>
  {/if}
</div>
