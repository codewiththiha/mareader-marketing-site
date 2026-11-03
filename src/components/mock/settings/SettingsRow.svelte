<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		focus,
		style = "",
		open = false,
		children
	}: {
		focus?: string;
		style?: string;
		open?: boolean;
		children: Snippet;
	} = $props();
</script>

<div
	data-focus={focus}
	class="flex items-center"
	style="min-height:40px;padding:7px 12px;gap:10px;font-size:13px;border-top:1px solid var(--line);{open
		? 'background:color-mix(in srgb, var(--accent-soft) 35%, transparent);'
		: ''}{style}"
>
	{@render children()}
</div>
