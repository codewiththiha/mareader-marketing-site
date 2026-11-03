<script lang="ts">
	import type { Book } from "$lib/content";

	let { book, width }: { book: Book; width: number } = $props();

	const h = $derived(Math.round(width * 1.5));
	const big = $derived(width >= 56);
	const radius = $derived(
		`${Math.max(1, width * 0.03)}px ${Math.max(2, width * 0.07)}px ${Math.max(2, width * 0.07)}px ${Math.max(1, width * 0.03)}px`
	);
</script>

<div
	class="relative shrink-0"
	style="width:{width}px;height:{h}px;border-radius:{radius};background:linear-gradient(180deg, color-mix(in srgb, {book.tone} 82%, white) 0%, {book.tone} 38%, color-mix(in srgb, {book.tone} 86%, black) 100%);box-shadow:0 1px 1px rgba(0,0,0,.25), 0 {Math.max(
		2,
		width * 0.08
	)}px {Math.max(
		6,
		width * 0.22
	)}px rgba(0,0,0,.22), inset 0 0 0 0.5px rgba(255,255,255,.14);color:#e3c572;font-family:var(--font-serif)"
>
	<span
		class="absolute inset-y-0"
		style="left:{width * 0.1}px;width:1px;background:rgba(0,0,0,.35);box-shadow:1px 0 0 rgba(255,255,255,.12)"
	></span>
	{#if big}
		<div class="absolute inset-0 flex flex-col items-center" style="padding-top:{h * 0.17}px">
			<div
				class="flex items-center justify-center"
				style="width:{width * 0.5}px;height:{width * 0.5}px;border:1px solid rgba(227,197,114,.75);font-size:{width *
					0.34}px;font-weight:500;line-height:1"
			>
				{book.title[0]}
			</div>
			<span class="mt-2 block" style="width:{width * 0.22}px;height:1px;background:rgba(227,197,114,.7)"></span>
			<span
				class="absolute"
				style="bottom:{h * 0.08}px;font-size:{Math.max(
					5,
					width * 0.085
				)}px;letter-spacing:0.22em;font-family:var(--font-sans)"
			>
				{book.format}
			</span>
			{#if book.progress}
				<span
					class="absolute flex items-start justify-center"
					style="top:-1px;right:{width * 0.14}px;width:{width * 0.2}px;height:{h *
						0.2}px;background:var(--accent);color:var(--ink-on-accent);font-size:{Math.max(
						5,
						width * 0.08
					)}px;font-family:var(--font-sans);font-weight:600;padding-top:3px;clip-path:polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)"
				>
					{book.progress}%
				</span>
			{/if}
		</div>
	{:else}
		<div class="absolute inset-0 flex items-center justify-center" style="font-size:{width * 0.5}px;font-weight:500">
			{book.title[0]}
		</div>
	{/if}
</div>
