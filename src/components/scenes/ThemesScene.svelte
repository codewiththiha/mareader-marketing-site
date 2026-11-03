<script lang="ts">
	import { contentArea, type PaneSpec, type Tree } from "$lib/mock/geometry";
	import { book } from "$lib/scenes/panes";
	import { THEMES_DURATION, THEMES_INITIAL, THEMES_STEPS } from "$lib/scenes/themes";
	import { StageRunner } from "$lib/stage/runner.svelte";
	import AppearancePopover from "$components/mock/overlays/AppearancePopover.svelte";
	import Panes from "$components/mock/window/Panes.svelte";
	import Window from "$components/mock/window/Window.svelte";
	import StageShell from "$components/stage/StageShell.svelte";

	const stage = new StageRunner(THEMES_STEPS, THEMES_INITIAL, THEMES_DURATION);
	const tree: Tree = { axis: "h", ratio: 0.5, a: "A", b: "B" };
	const panes: PaneSpec[] = [
		{ id: "A", book: book("moby") },
		{ id: "B", book: book("einstein") }
	];
	const area = $derived(contentArea(stage.design.w, stage.design.h, false));
</script>

<StageShell runner={stage}>
	<Window
		look={stage.ph.state.look}
		width={stage.design.w}
		height={stage.design.h}
		title="Moby-Dick; or, The Whale"
		bar={{ appearanceOpen: stage.ph.state.popover }}
	>
		<Panes {tree} {area} {panes} windowLook={stage.ph.state.look} />
		{#if stage.ph.state.popover}
			<AppearancePopover look={stage.ph.state.look} pressing={stage.ph.state.pressing} />
		{/if}
	</Window>
</StageShell>
