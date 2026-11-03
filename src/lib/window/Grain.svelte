<script lang="ts">
  import { styles } from "@/lib/style";
  import { grainStyle } from "@/lib/window/pattern";
  import type { Appearance } from "@/lib/palette";

  let { look, dark }: { look: Appearance; dark: boolean } = $props();
</script>

{#if look.noise !== "off"}
  <div class="pointer-events-none absolute inset-0 z-40" style={styles(grainStyle(look, dark))}></div>
{/if}
