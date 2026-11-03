<script lang="ts">
	import type { Snippet } from "svelte";
	import { cssVarsStyle, tokensOf, type Appearance } from "$lib/palette";
	import { SIDEBAR_W } from "$lib/mock/geometry";
	import Grain from "./Grain.svelte";
	import Sidebar from "./Sidebar.svelte";
	import TitleBar from "./TitleBar.svelte";

	let {
		look,
		width,
		height,
		title,
		sidebar = false,
		dragging,
		bar,
		children
	}: {
		look: Appearance;
		width: number;
		height: number;
		title: string;
		sidebar?: boolean;
		dragging?: string | null;
		bar?: { appearanceOpen?: boolean; settingsOpen?: boolean };
		children?: Snippet;
	} = $props();

	const tokens = $derived(tokensOf(look));
	const left = $derived(sidebar ? SIDEBAR_W : 0);
</script>

<div
	class="mw relative overflow-hidden select-none"
	style="width:{width}px;height:{height}px;background:var(--paper);color:var(--ink);font-family:var(--font-sans);font-size:14px;border-radius:12px;{cssVarsStyle(
		tokens
	)}"
>
	{@render children?.()}
	<TitleBar
		{title}
		{left}
		lights={!sidebar}
		appearanceOpen={bar?.appearanceOpen}
		settingsOpen={bar?.settingsOpen}
		sidebarOn={sidebar}
	/>
	{#if sidebar}<Sidebar {dragging} />{/if}
	<Grain {look} dark={tokens.dark} />
</div>
