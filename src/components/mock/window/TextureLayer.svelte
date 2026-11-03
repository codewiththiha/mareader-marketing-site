<script lang="ts">
	import { NOISE } from "$lib/mock/noise";
	import type { Appearance } from "$lib/palette";

	let { look, dark }: { look: Appearance; dark: boolean } = $props();

	const s = $derived(look.textureScale / 100 || 1);
	const op = $derived(look.textureOpacity / 100);
	const stroke = $derived(dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.16)");

	const style = $derived.by(() => {
		if (look.texture === "paper")
			return `background-image:${NOISE};background-size:${180 * s}px ${180 * s}px;mix-blend-mode:${dark ? "screen" : "multiply"};opacity:${op * (dark ? 0.22 : 0.42)}`;
		if (look.texture === "lined")
			return `background-image:repeating-linear-gradient(180deg, transparent 0 ${26 * s - 1}px, ${stroke} ${26 * s - 1}px ${26 * s}px);opacity:${op}`;
		if (look.texture === "grid")
			return `background-image:repeating-linear-gradient(180deg, transparent 0 ${26 * s - 1}px, ${stroke} ${26 * s - 1}px ${26 * s}px), repeating-linear-gradient(90deg, transparent 0 ${26 * s - 1}px, ${stroke} ${26 * s - 1}px ${26 * s}px);opacity:${op}`;
		if (look.texture === "dotted")
			return `background-image:radial-gradient(${stroke} 0.6px, transparent 0.9px);background-size:${8 * s}px ${8 * s}px;opacity:${op}`;
		return `background-image:linear-gradient(${stroke}, ${stroke}), linear-gradient(${stroke}, ${stroke});background-size:${5 * s}px 1px, 1px ${5 * s}px;background-position:${10.5 * s}px ${13 * s}px, ${13 * s}px ${10.5 * s}px;background-repeat:repeat;opacity:${op};-webkit-mask-image:radial-gradient(circle at ${13 * s}px ${13 * s}px, black ${4 * s}px, transparent ${4.2 * s}px);-webkit-mask-size:${26 * s}px ${26 * s}px;mask-image:radial-gradient(circle at ${13 * s}px ${13 * s}px, black ${4 * s}px, transparent ${4.2 * s}px);mask-size:${26 * s}px ${26 * s}px`;
	});
</script>

{#if look.texture !== "none"}
	<div class="pointer-events-none absolute inset-0" {style}></div>
{/if}
