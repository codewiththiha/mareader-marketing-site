<script lang="ts">
	import type { Snippet } from "svelte";
	import { cssVarsStyle, tokensOf, type Appearance, type Tokens } from "$lib/palette";
	import { count, layout, type PaneSpec, type Rect, type Tree } from "$lib/mock/geometry";
	import EpubPage from "./EpubPage.svelte";
	import EmptyPane from "./EmptyPane.svelte";
	import PdfPage from "./PdfPage.svelte";
	import TextureLayer from "./TextureLayer.svelte";

	let {
		tree,
		area,
		panes,
		windowLook,
		dropZone,
		children
	}: {
		tree: Tree;
		area: Rect;
		panes: PaneSpec[];
		windowLook: Appearance;
		dropZone?: { pane: string; side: "right" | "bottom" } | null;
		children?: Snippet<[PaneSpec, Rect, Tokens]>;
	} = $props();

	const laid = $derived(layout(tree, area));
	const rects = $derived(laid.rects);
	const dividers = $derived(laid.dividers);
	const split = $derived(count(tree) > 1);
</script>

{#each panes as p (p.id)}
	{@const r = rects.get(p.id)}
	{#if r}
		{@const look = p.look ?? windowLook}
		{@const t = tokensOf(look)}
		{@const own = !!p.look}
		<div
			data-focus="pane-{p.id}"
			class="geo absolute overflow-hidden"
			style="left:{r.x}px;top:{r.y}px;width:{r.w}px;height:{r.h}px;background:var(--page-paper);{own
				? cssVarsStyle(t)
				: ''}"
		>
			{#if children}
				{@render children(p, r, t)}
			{:else if p.book}
				{#if p.book.format === "PDF"}
					<PdfPage width={r.w} {look} dark={t.dark} />
				{:else}
					<EpubPage book={p.book} width={r.w} />
				{/if}
			{:else}
				<EmptyPane />
			{/if}
			{#if p.book?.format !== "PDF"}<TextureLayer {look} dark={t.dark} />{/if}
			{#if dropZone?.pane === p.id}
				<div
					class="absolute"
					style="{dropZone.side === 'right'
						? `top:4px;bottom:4px;right:4px;width:${r.w / 2 - 6}px`
						: `left:4px;right:4px;bottom:4px;height:${r.h / 2 - 6}px`};border-radius:10px;background:color-mix(in srgb, var(--accent) 14%, transparent);box-shadow:inset 0 0 0 2px var(--accent);animation:fade-in 0.25s ease both"
				></div>
			{/if}
		</div>
	{/if}
{/each}
{#if split}
	{#each dividers as d, i (i)}
		<div
			class="geo pointer-events-none absolute"
			style="{d.axis === 'h'
				? `left:${d.at - 0.5}px;top:${d.parent.y}px;width:1px;height:${d.parent.h}px`
				: `top:${d.at - 0.5}px;left:${d.parent.x}px;height:1px;width:${d.parent.w}px`};background:var(--line)"
		></div>
	{/each}
{/if}
