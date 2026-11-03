<script lang="ts">
	import type { Snippet } from "svelte";

	let { name, children }: { name: string; children: Snippet } = $props();
</script>

<div class="flex items-center" style="min-height:20px;gap:8px">
	<span style="width:64px;font-size:12px;color:var(--muted);flex-shrink:0">{name}</span>
	{@render children()}
</div>
