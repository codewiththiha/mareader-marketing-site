<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		primary = false,
		small = false,
		focus,
		style = "",
		children
	}: {
		primary?: boolean;
		small?: boolean;
		focus?: string;
		style?: string;
		children: Snippet;
	} = $props();
</script>

<span
	data-focus={focus}
	class="inline-flex shrink-0 items-center justify-center"
	style="height:{small ? 24 : 28}px;padding:{small ? '0 8px' : '0 10px'};gap:6px;font-size:{small
		? 12
		: 13}px;border-radius:8px;background:{primary ? 'var(--accent)' : 'var(--paper)'};color:{primary
		? 'var(--ink-on-accent)'
		: 'var(--ink)'};border:{primary ? '1px solid transparent' : '1px solid var(--line)'};{style}"
>
	{@render children()}
</span>
