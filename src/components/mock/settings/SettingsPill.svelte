<script lang="ts">
	import type { Snippet } from "svelte";

	let { tone = "soft", children }: { tone?: "soft" | "accent"; children: Snippet } = $props();
</script>

<span
	style="font-size:11px;padding:2px 7px;border-radius:7px;background:{tone === 'accent'
		? 'var(--accent)'
		: 'var(--accent-soft)'};color:{tone === 'accent' ? 'var(--ink-on-accent)' : 'var(--ink)'}"
>
	{@render children()}
</span>
