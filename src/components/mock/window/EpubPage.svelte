<script lang="ts">
	import type { Snippet } from "svelte";
	import { MOBY, PAGE_TEXTS, type Book } from "$lib/content";

	let {
		book,
		width,
		offset = 0,
		top = 64,
		children
	}: {
		book: Book;
		width: number;
		offset?: number;
		top?: number;
		children?: Snippet;
	} = $props();

	const text = $derived(PAGE_TEXTS[book.id] ?? MOBY);
	const size = $derived(width >= 700 ? 17 : width >= 480 ? 15 : 13.5);
</script>

<div
	class="absolute inset-0 overflow-hidden"
	style="color:var(--page-ink);background:var(--page-paper);font-family:var(--font-serif)"
>
	<div
		class="mx-auto"
		style="max-width:560px;padding:{top}px 40px 40px;font-size:{size}px;line-height:1.58;transform:translateY({-offset}px);transition:transform 1.1s var(--ease-out-quint)"
	>
		<div
			style="font-family:var(--font-sans);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);margin-bottom:6px"
		>
			{text.chapter}
		</div>
		{#if text.heading}
			<h3 style="font-size:{size * 1.55}px;font-weight:600;line-height:1.2;margin-bottom:{size * 1.1}px">
				{text.heading}
			</h3>
		{/if}
		{#if children}
			{@render children()}
		{:else}
			{#each text.paragraphs as p, i (i)}
				<p style="text-align:justify;hyphens:auto;text-indent:{i === 0 ? 0 : '1.4em'}">{p}</p>
			{/each}
		{/if}
	</div>
</div>
