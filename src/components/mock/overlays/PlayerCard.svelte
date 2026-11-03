<script lang="ts">
	import type { Snippet } from "svelte";
	import type { Book } from "$lib/content";
	import Cover from "../window/Cover.svelte";
	import PlayerControls from "./PlayerControls.svelte";

	let {
		x,
		y,
		book,
		playing,
		at,
		left,
		speed,
		place,
		narrator,
		lyrics
	}: {
		x: number;
		y: number;
		book: Book;
		playing: boolean;
		at: number;
		left: string;
		speed: string;
		place: string;
		narrator: string;
		lyrics: { before?: string; now: Snippet; after?: string };
	} = $props();
</script>

<div
	data-focus="player"
	class="absolute z-40 flex flex-col"
	style="left:{x}px;top:{y}px;transform:translateX(-50%);width:420px;height:224px;padding:14px;border-radius:18px;background:var(--surface);border:1px solid var(--line);box-shadow:0 14px 42px var(--shadow);animation:rise-in 0.3s var(--ease-out-quint) both"
>
	<div class="flex min-h-0 flex-1" style="gap:14px">
		<Cover {book} width={70} />
		<div class="flex min-w-0 flex-1 flex-col">
			<div class="flex items-center" style="gap:8px">
				<span class="truncate" style="font-size:15px;font-weight:500">{book.title}</span>
				<span class="flex shrink-0 items-end" style="gap:2px;height:14px;width:18px">
					{#each [0, 1, 2] as i (i)}
						<span
							class="block flex-1 origin-bottom rounded-sm"
							style="height:100%;background:var(--accent);animation:{playing
								? `bars 0.9s ease-in-out ${i * 0.15}s infinite`
								: 'none'};transform:{playing ? 'none' : 'scaleY(0.35)'}"
						></span>
					{/each}
				</span>
			</div>
			<div class="truncate" style="font-size:12px;color:var(--muted)">{place} · {narrator}</div>
			<div class="relative mt-2 min-h-0 flex-1 overflow-hidden" style="line-height:1.35;font-family:var(--font-serif)">
				{#if lyrics.before}
					<div class="truncate" style="font-size:13px;color:var(--muted)">{lyrics.before}</div>
				{/if}
				<div style="font-size:16px;color:var(--ink);margin-top:2px">{@render lyrics.now()}</div>
				{#if lyrics.after}
					<div class="truncate" style="font-size:13px;color:var(--muted);margin-top:2px">{lyrics.after}</div>
				{/if}
				<div
					class="pointer-events-none absolute inset-x-0 bottom-0"
					style="height:18px;background:linear-gradient(transparent, var(--surface))"
				></div>
			</div>
		</div>
	</div>
	<div class="mt-2 flex justify-center">
		<PlayerControls {playing} {at} {left} {speed} track={160} />
	</div>
</div>
