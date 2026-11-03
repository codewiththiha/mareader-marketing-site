<script lang="ts">
  import type { Appearance } from "@/lib/palette";
  import { styles } from "@/lib/style";
  import PdfSheet from "@/lib/window/PdfSheet.svelte";

  let { width, look, dark }: { width: number; look: Appearance; dark: boolean } = $props();
  const sheet = $derived(Math.min(width - 56, 460));
  const fs = $derived(sheet / 62);
</script>

<div class="absolute inset-0 overflow-hidden" style={styles({ background: "var(--paper)" })}>
  <div style={styles({ paddingTop: 64 })}>
    <PdfSheet page={1} {sheet} {fs} {look} {dark} />
    <div style={styles({ height: 24 })}></div>
    <PdfSheet page={2} {sheet} {fs} {look} {dark} />
  </div>
</div>
