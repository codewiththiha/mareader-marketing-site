<script lang="ts">
	import type { Snippet } from "svelte";

	let { title, style = "", children }: { title: string; style?: string; children: Snippet } = $props();
</script>

<div style="margin-bottom:14px;{style}">
	<div style="font-size:12px;font-weight:500;color:var(--muted);margin-bottom:6px">{title}</div>
	<div
		class="flex flex-col overflow-hidden"
		style="border-radius:10px;background:var(--card);border:1px solid var(--line)"
	>
		{@render children()}
	</div>
</div>
