<script lang="ts">
	import { Volume2, X } from "lucide-svelte";
	import { CARD_CARET as CARET, CARD_GAP as GAP, CARD_MARGIN, CARD_W, type WordAnswer } from "$lib/mock/study";
	import CardHeading from "./CardHeading.svelte";

	let {
		at,
		room,
		answer,
		phase,
		progress
	}: {
		at: { x: number; y: number; w: number; h: number };
		room: { x: number; w: number };
		answer: WordAnswer;
		phase: "waiting" | "partial" | "ready";
		progress: number;
	} = $props();

	const total = CARD_W + CARD_MARGIN * 2 + 2;
	const half = total / 2;
	const lo = $derived(room.x + 8 + half);
	const cx = $derived(Math.min(Math.max(at.x + at.w / 2, lo), room.x + room.w - 8 - half));
	const left = $derived(cx - half);
	const caretX = $derived(at.x + at.w / 2 - left);
	const top = $derived(at.y + at.h + GAP);
	const meaningChars = $derived(Math.floor(answer.meaning.length * Math.min(1, progress * 1.6)));
	const synCount = $derived(Math.floor(answer.synonyms.length * Math.min(1, Math.max(0, (progress - 0.35) * 2.2))));
	const useCount = $derived(Math.floor(answer.usages.length * Math.min(1, Math.max(0, (progress - 0.6) * 2.6))));
</script>

<div
	data-focus="word-card"
	class="absolute z-40"
	style="left:{left}px;top:{top}px;width:{total}px;padding:{CARD_MARGIN}px;border-radius:12px;background:var(--surface);border:1px solid var(--line);box-shadow:0 8px 24px var(--shadow);color:var(--ink);font-family:var(--font-sans);animation:rise-in 0.16s var(--ease-out-quint) both"
>
	<span
		class="absolute"
		style="left:{caretX -
			CARET}px;top:{-CARET}px;width:0;height:0;border-left:{CARET}px solid transparent;border-right:{CARET}px solid transparent;border-bottom:{CARET}px solid var(--line)"
	></span>
	<span
		class="absolute"
		style="left:{caretX - CARET + 1.2}px;top:{-CARET + 1.6}px;width:0;height:0;border-left:{CARET -
			1.2}px solid transparent;border-right:{CARET - 1.2}px solid transparent;border-bottom:{CARET -
			1.2}px solid var(--surface)"
	></span>
	<div class="flex items-center" style="gap:8px">
		<span style="font-size:19px;font-weight:600">{answer.word}</span>
		<span style="font-size:14px;font-style:italic;color:var(--muted)">{answer.pos}</span>
		<span style="font-size:12px;font-weight:600;color:var(--muted)">{answer.level}</span>
		<span class="ml-auto flex items-center" style="gap:2px;color:var(--muted)">
			<Volume2 size={15} />
			<span style="width:8px"></span>
			<X size={15} />
		</span>
	</div>
	{#if phase === "waiting"}
		<div class="mt-3 flex flex-col" style="gap:6px">
			{#each [0.35, 1, 0.8] as w, i (i)}
				<div
					style="height:12px;width:{w *
						100}%;border-radius:4px;background:var(--line);animation:breathe 1.4s ease-in-out infinite;animation-delay:{i *
						0.12}s"
				></div>
			{/each}
			<div style="font-size:12px;color:var(--muted);margin-top:2px">Looking up…</div>
		</div>
	{:else}
		<div class="flex flex-col" style="gap:6px;margin-top:4px">
			<CardHeading>Meaning</CardHeading>
			<p style="font-size:14px;line-height:1.45;min-height:20px">{answer.meaning.slice(0, meaningChars)}</p>
			{#if synCount > 0}
				<CardHeading>Synonyms</CardHeading>
				<div class="flex flex-wrap" style="gap:6px 4px">
					{#each answer.synonyms.slice(0, synCount) as s (s)}
						<span
							style="font-size:12px;padding:3px 8px;border-radius:8px;background:var(--accent-soft);animation:rise-in 0.2s ease both"
						>
							{s}
						</span>
					{/each}
				</div>
			{/if}
			{#if useCount > 0}
				<CardHeading>Usages</CardHeading>
				{#each answer.usages.slice(0, useCount) as u (u)}
					<div class="flex" style="gap:6px;font-size:14px;line-height:1.4;animation:rise-in 0.2s ease both">
						<span style="color:var(--muted)">•</span>
						<span style="font-style:italic">{u}</span>
					</div>
				{/each}
			{/if}
			{#if phase === "partial"}
				<div style="font-size:12px;color:var(--muted);margin-top:2px">Looking up…</div>
			{:else}
				<div class="flex items-center justify-between" style="margin-top:4px;font-size:12px">
					<span style="color:var(--muted)">{answer.by}</span>
					<span style="color:var(--accent)">Ask again</span>
				</div>
			{/if}
		</div>
	{/if}
</div>
