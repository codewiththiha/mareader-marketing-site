<script lang="ts">
	import { BookSearch, Copy, Highlighter, StickyNote, Underline, Volume2 } from "lucide-svelte";
	import AiMark from "$lib/icons/AiMark.svelte";
	import IconButton from "../window/IconButton.svelte";

	let { x, y, pressed }: { x: number; y: number; pressed?: "ai" | null } = $props();
</script>

<div
	data-focus="selection-bar"
	class="absolute z-40 flex items-center"
	style="left:{x}px;top:{y}px;transform:translateX(-50%);padding:3px;gap:1px;border-radius:10px;background:var(--surface);border:1px solid var(--line);box-shadow:0 6px 18px var(--shadow);animation:rise-in 0.18s var(--ease-out-quint) both"
>
	<span><IconButton icon={Copy} size={32} iconSize={16} /></span>
	<span>
		<div
			class="flex items-center justify-center"
			style="width:32px;height:32px;border-radius:8px;background:{pressed === 'ai'
				? 'var(--accent-soft)'
				: 'transparent'};color:{pressed === 'ai' ? 'var(--accent)' : 'var(--ink)'}"
		>
			<AiMark size={16} />
		</div>
	</span>
	<span><IconButton icon={BookSearch} size={32} iconSize={16} /></span>
	<span><IconButton icon={Highlighter} size={32} iconSize={16} /></span>
	<span><IconButton icon={Underline} size={32} iconSize={16} /></span>
	<span><IconButton icon={Volume2} size={32} iconSize={16} /></span>
	<span><IconButton icon={StickyNote} size={32} iconSize={16} /></span>
</div>
