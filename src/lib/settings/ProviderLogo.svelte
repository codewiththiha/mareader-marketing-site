<script lang="ts">
  import { Server } from "@lucide/svelte";
  import { logoSvg, type ProviderId } from "@/lib/settings/providers";
  import { styles } from "@/lib/style";

  let { id, size = 18 }: { id: ProviderId; size?: number } = $props();
  const svg = $derived(logoSvg(id, size));
</script>

{#if svg === null}
  <Server {size} strokeWidth={2} />
{:else}
  <span class="inline-flex shrink-0" style={styles({ width: size, height: size })}>{@html svg}</span>
{/if}
