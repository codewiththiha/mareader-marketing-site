<script lang="ts">
	import { PAPER } from "$lib/content";
	import TextureLayer from "./TextureLayer.svelte";
	import type { Appearance } from "$lib/palette";

	let { page, sheet, fs, dark, look }: { page: 1 | 2; sheet: number; fs: number; dark: boolean; look: Appearance } =
		$props();
</script>

<div
	class="relative mx-auto overflow-hidden"
	style="width:{sheet}px;height:{sheet * 1.294}px;background:var(--page-paper);color:var(--page-ink);box-shadow:{dark
		? '0 2px 10px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04)'
		: '0 1px 2px rgba(0,0,0,.12), 0 4px 14px rgba(0,0,0,.14)'};padding:{sheet * 0.09}px {sheet *
		0.1}px;font-family:var(--font-serif);font-size:{fs}px;line-height:1.42;text-align:justify;hyphens:auto"
>
	{#if page === 1}
		<div style="text-align:center;font-size:{fs * 1.75}px;font-weight:600;line-height:1.15">{PAPER.title}</div>
		<div style="text-align:center;font-style:italic;font-size:{fs * 1.15}px;margin-top:{fs * 0.9}px">
			By {PAPER.author}
		</div>
		<div
			style="text-align:center;font-size:{fs * 0.85}px;color:var(--muted);margin-top:{fs * 0.3}px;margin-bottom:{fs *
				1.6}px"
		>
			{PAPER.note}
		</div>
		<p style="margin-inline:{sheet * 0.06}px;font-size:{fs * 0.92}px">{PAPER.abstract}</p>
		<div style="columns:2;column-gap:{sheet * 0.05}px;margin-top:{fs * 1.2}px">
			<div style="font-weight:600;text-align:center;margin-bottom:{fs * 0.5}px">I. KINEMATICAL PART</div>
			<div style="font-style:italic;text-align:center;margin-bottom:{fs * 0.6}px">§ 1. Definition of Simultaneity</div>
			{#each PAPER.body as p, i (i)}
				<p style="margin-bottom:{fs * 0.55}px">
					{p}
					{#if i === 1}
						<span
							class="block"
							style="text-align:center;font-style:italic;margin:{fs * 0.6}px 0;font-size:{fs * 1.15}px"
						>
							τ = β (t − v x / c²), ξ = β (x − v t)
						</span>
					{/if}
				</p>
			{/each}
		</div>
	{:else}
		<div style="columns:2;column-gap:{sheet * 0.05}px">
			{#each [...PAPER.body, PAPER.abstract] as p, i (i)}
				<p style="margin-bottom:{fs * 0.55}px">{p}</p>
			{/each}
		</div>
	{/if}
	<span
		class="absolute inset-x-0"
		style="bottom:{sheet * 0.035}px;text-align:center;font-size:{fs *
			0.9}px;font-family:var(--font-sans);color:var(--muted)"
	>
		{page + 890}
	</span>
	<TextureLayer {look} {dark} />
</div>
