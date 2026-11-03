<script lang="ts">
	let { value, min, max, shown, focus }: { value: number; min: number; max: number; shown: string; focus?: string } =
		$props();

	const p = $derived(Math.min(1, Math.max(0, (value - min) / (max - min))));
</script>

<div data-focus={focus} class="flex flex-1 items-center gap-2" style="height:20px">
	<div class="relative flex-1" style="height:4px;border-radius:2px;background:var(--line)">
		<div
			class="absolute inset-y-0 left-0"
			style="width:{p * 100}%;border-radius:2px;background:var(--accent);transition:width 0.12s linear"
		></div>
		<span
			class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
			style="left:{p *
				100}%;width:14px;height:14px;background:var(--paper);box-shadow:0 0 0 1px var(--line), 0 1px 3px rgba(0,0,0,.25);transition:left 0.12s linear"
		></span>
	</div>
	<span
		class="flex shrink-0 items-center justify-center tabular-nums"
		style="width:52px;height:20px;font-size:11px;border-radius:6px;border:1px solid var(--line);color:var(--ink);background:var(--paper)"
	>
		{shown}
	</span>
</div>
