<script lang="ts">
  import { styles } from "@/lib/style";
  import { textureStyle } from "@/lib/window/pattern";
  import type { Appearance } from "@/lib/palette";

  let { look, dark }: { look: Appearance; dark: boolean } = $props();
</script>

{#if look.texture !== "none"}
  <div class="pointer-events-none absolute inset-0" style={styles(textureStyle(look, dark))}></div>
{/if}
