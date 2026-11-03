<script lang="ts">
	import { Pause, Play, SkipBack, SkipForward, Square } from "lucide-svelte";
	import IconButton from "../window/IconButton.svelte";

	let {
		playing,
		at,
		left,
		speed,
		track
	}: {
		playing: boolean;
		at: number;
		left: string;
		speed: string;
		track: number;
	} = $props();
</script>

<div class="flex items-center" style="gap:2px">
	<IconButton icon={SkipBack} size={32} iconSize={16} />
	<div
		class="flex items-center justify-center"
		style="width:36px;height:36px;border-radius:18px;background:var(--accent);color:var(--ink-on-accent)"
	>
		{#if playing}
			<Pause size={16} fill="currentColor" strokeWidth={0} />
		{:else}
			<Play size={16} fill="currentColor" strokeWidth={0} style="margin-left:2px" />
		{/if}
	</div>
	<IconButton icon={SkipForward} size={32} iconSize={16} />
	<span style="width:6px"></span>
	<div class="flex items-center" style="gap:8px;width:{track}px">
		<div class="relative flex-1" style="height:4px;border-radius:2px;background:var(--line)">
			<div
				class="absolute inset-y-0 left-0"
				style="width:{at * 100}%;border-radius:2px;background:var(--accent);transition:width 0.3s linear"
			></div>
		</div>
		<span class="tabular-nums" style="width:66px;font-size:12px;color:var(--muted);text-align:right">{left}</span>
	</div>
	<span class="tabular-nums" style="width:54px;font-size:12px;text-align:center;color:var(--ink)">{speed}</span>
	<IconButton icon={Square} size={32} iconSize={14} />
</div>
