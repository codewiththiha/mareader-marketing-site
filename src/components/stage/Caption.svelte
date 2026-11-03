<script lang="ts">
	import { untrack } from "svelte";

	let { text }: { text: string } = $props();

	interface Entry {
		key: number;
		text: string;
	}

	let shown = $state<Entry[]>([{ key: 0, text: untrack(() => text) }]);
	let nextKey = 0;

	$effect(() => {
		const last = shown[shown.length - 1];
		if (last && last.text === text) return;
		nextKey += 1;
		shown = [...shown.slice(-1), { key: nextKey, text }];
	});

	$effect(() => {
		if (shown.length < 2) return;
		const id = setTimeout(() => {
			shown = shown.slice(-1);
		}, 320);
		return () => clearTimeout(id);
	});
</script>

<div class="relative mt-5 min-h-[3.4em] text-[15px] leading-[1.5] sm:min-h-[2.6em] sm:text-[16px]" aria-live="polite">
	{#each shown as s, i (s.key)}
		<p
			class="absolute inset-x-0 top-0 mx-auto max-w-[62ch] text-center text-balance {i === shown.length - 1
				? 'caption-in'
				: 'caption-out'}"
			style="color:var(--ink)"
		>
			{s.text}
		</p>
	{/each}
</div>
