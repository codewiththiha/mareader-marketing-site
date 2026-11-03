<script lang="ts">
	import type { Snippet } from "svelte";
	import { inView } from "$lib/actions/inview";
	import type { StageView } from "$lib/stage/runner.svelte";
	import Caption from "./Caption.svelte";

	let { runner, ring = true, children }: { runner: StageView; ring?: boolean; children: Snippet } = $props();
</script>

<div class="flex flex-col">
	<div
		bind:this={runner.stageEl}
		bind:clientWidth={runner.width}
		use:inView={runner.view}
		class="relative w-full overflow-hidden rounded-[14px]"
		style="height:{runner.design.h *
			runner.fit}px;background:var(--surface);box-shadow:0 0 0 1px var(--line), 0 24px 60px -24px rgba(0,0,0,0.35)"
	>
		<div
			class="absolute top-0 left-0"
			style="width:{runner.design.w}px;height:{runner.design.h}px;transform:scale({runner.fit});transform-origin:0 0"
		>
			<div
				bind:this={runner.zoomerEl}
				class="zoomer relative"
				style="width:{runner.design.w}px;height:{runner.design
					.h}px;transform:{runner.transform};transform-origin:0 0;transition:transform 1.05s cubic-bezier(0.22, 1, 0.36, 1)"
			>
				{@render children()}
				{#if ring}
					<div class="pointer-events-none absolute z-[60]" style={runner.ringStyle}></div>
				{/if}
			</div>
		</div>
	</div>
	<Caption text={runner.ph.caption} />
</div>
