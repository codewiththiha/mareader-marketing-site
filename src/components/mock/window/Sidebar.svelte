<script lang="ts">
	import { LayoutGrid, LibraryBig, ListTree, StickyNote } from "lucide-svelte";
	import { BOOKS } from "$lib/content";
	import { BAR_H, SIDEBAR_W } from "$lib/mock/geometry";
	import Cover from "./Cover.svelte";
	import IconButton from "./IconButton.svelte";
	import TrafficLights from "./TrafficLights.svelte";

	let { dragging, width = SIDEBAR_W }: { dragging?: string | null; width?: number } = $props();
</script>

<div
	class="absolute inset-y-0 left-0 z-20 flex flex-col"
	style="width:{width}px;background:var(--surface);border-right:1px solid var(--line)"
>
	<div class="flex items-center" style="height:{BAR_H}px;padding-left:20px;padding-right:8px">
		<TrafficLights />
		<div class="ml-auto flex items-center gap-1">
			<IconButton icon={LayoutGrid} size={32} iconSize={16} />
			<IconButton icon={ListTree} size={32} iconSize={16} />
			<IconButton icon={LibraryBig} size={32} iconSize={16} pressed />
			<IconButton icon={StickyNote} size={32} iconSize={16} />
		</div>
	</div>
	<div
		class="flex items-center justify-between"
		style="padding:6px 16px 4px;font-size:12px;font-weight:500;color:var(--muted)"
	>
		<span>Library</span>
		<span style="font-weight:400">{BOOKS.length} books</span>
	</div>
	<div class="flex flex-col" style="padding:2px 8px">
		{#each BOOKS as b (b.id)}
			<div
				data-focus="lib-{b.id}"
				class="flex items-center gap-3"
				style="height:46px;padding:0 8px;border-radius:8px;opacity:{dragging === b.id
					? 0.35
					: 1};background:{dragging === b.id ? 'var(--hover)' : 'transparent'}"
			>
				<Cover book={b} width={22} />
				<div class="min-w-0 flex-1">
					<div class="truncate" style="font-size:13px;color:var(--ink)">{b.short}</div>
					<div class="truncate" style="font-size:11px;color:var(--muted)">{b.author} · {b.format}</div>
				</div>
			</div>
		{/each}
	</div>
</div>
