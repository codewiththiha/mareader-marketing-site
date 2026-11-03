<script lang="ts">
	import { NOISE } from "$lib/mock/noise";
	import type { Appearance } from "$lib/palette";

	let { look, dark }: { look: Appearance; dark: boolean } = $props();
</script>

{#if look.noise !== "off"}
	<div
		class="pointer-events-none absolute inset-0 z-40"
		style="background-image:{NOISE};background-size:180px 180px;mix-blend-mode:{dark
			? 'screen'
			: 'multiply'};opacity:{(look.noiseIntensity / 100) * (dark ? 0.35 : 0.3)};animation:{look.noise === 'animated'
			? 'grain-crawl 0.5s steps(6) infinite'
			: 'none'}"
	></div>
{/if}
