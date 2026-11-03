<script lang="ts">
	import { ChevronDown, ChevronRight } from "lucide-svelte";
	import type { Snippet } from "svelte";

	let { title, summary, open, trailing }: { title: string; summary?: string; open: boolean; trailing?: Snippet } =
		$props();
</script>

<div class="flex items-center" style="height:24px;font-size:12px;color:var(--ink)">
	{#if open}
		<ChevronDown size={12} strokeWidth={2} style="color:var(--muted);margin-right:6px" />
	{:else}
		<ChevronRight size={12} strokeWidth={2} style="color:var(--muted);margin-right:6px" />
	{/if}
	<span>{title}</span>
	{#if !open && summary}
		<span class="ml-auto truncate" style="color:var(--muted);max-width:180px">{summary}</span>
	{/if}
	{#if trailing}
		<span class="ml-auto">{@render trailing()}</span>
	{/if}
</div>
