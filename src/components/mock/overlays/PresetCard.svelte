<script lang="ts">
	import { hex, tokensOf, type Appearance } from "$lib/palette";

	let {
		id,
		name,
		look,
		selected,
		pressed = false
	}: {
		id: string;
		name: string;
		look: Appearance;
		selected: boolean;
		pressed?: boolean;
	} = $props();

	const t = $derived(tokensOf(look));
	const paper = $derived(hex(t.pagePaper));
	const ink = $derived(hex(t.pageInk));
</script>

<div data-focus="preset-{id}" class="flex flex-col items-center" style="flex:1;min-width:0">
	<div
		class="relative w-full overflow-hidden"
		style="aspect-ratio:1 / 0.7;border-radius:6px;background:{paper};box-shadow:{selected
			? 'inset 0 0 0 2px var(--accent)'
			: pressed
				? 'inset 0 0 0 2px var(--muted)'
				: 'inset 0 0 0 1px var(--line)'};transform:scale({pressed
			? 0.96
			: 1});transition:transform 0.15s, box-shadow 0.2s"
	>
		<div class="absolute" style="left:16%;right:16%;top:22%">
			{#each [1, 0.85, 0.95, 0.6] as w, i (i)}
				<div
					style="height:2px;width:{w * 100}%;background:{ink};opacity:0.55;margin-bottom:4px;border-radius:1px"
				></div>
			{/each}
		</div>
		{#if look.texture === "paper"}
			<div
				class="absolute inset-0"
				style="opacity:0.35;mix-blend-mode:{t.dark
					? 'screen'
					: 'multiply'};background-image:radial-gradient(rgba(0,0,0,.25) 0.5px, transparent 0.8px);background-size:3px 3px"
			></div>
		{/if}
	</div>
	<span class="mt-1 truncate" style="font-size:11px;color:{selected ? 'var(--accent)' : 'var(--ink)'};max-width:100%">
		{name}
	</span>
</div>
