<script lang="ts">
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
</script>

<div style="font-size:12px;font-weight:600;color:var(--muted);margin-top:2px">{@render children()}</div>
