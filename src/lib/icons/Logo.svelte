<script lang="ts">
  import { LOGOS, type LogoName } from "./logos";

  let { name, size = 22 }: { name: LogoName; size?: number } = $props();
  const svg = $derived(
    LOGOS[name].replace(/fill="white"/g, 'fill="currentColor"').replace(/width="24" height="24"/, `width="${size}" height="${size}"`),
  );
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted local provider marks -->
<span style="display: inline-flex; width: {size}px; height: {size}px">{@html svg}</span>
