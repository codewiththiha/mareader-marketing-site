<script lang="ts">
	import type { Appearance } from "$lib/palette";
	import PdfSheet from "./PdfSheet.svelte";

	let { width, look, dark }: { width: number; look: Appearance; dark: boolean } = $props();

	const sheet = $derived(Math.min(width - 56, 460));
	const fs = $derived(sheet / 62);
</script>

<div class="absolute inset-0 overflow-hidden" style="background:var(--paper)">
	<div style="padding-top:64px">
		<PdfSheet page={1} {sheet} {fs} {dark} {look} />
		<div style="height:24px"></div>
		<PdfSheet page={2} {sheet} {fs} {dark} {look} />
	</div>
</div>
