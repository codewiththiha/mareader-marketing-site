<script lang="ts">
	import { DEFAULT_LOOK } from "$lib/palette";
	import { contentArea, type PaneSpec } from "$lib/mock/geometry";
	import { FOUR, book } from "$lib/scenes/panes";
	import { PER_PANE_DURATION, PER_PANE_INITIAL, PER_PANE_STEPS } from "$lib/scenes/perPane";
	import { StageRunner } from "$lib/stage/runner.svelte";
	import AppearancePopover from "$components/mock/overlays/AppearancePopover.svelte";
	import Panes from "$components/mock/window/Panes.svelte";
	import Window from "$components/mock/window/Window.svelte";
	import StageShell from "$components/stage/StageShell.svelte";

	const TITLES: Record<string, string> = { A: "moby", B: "pride", C: "walden", D: "einstein" };

	const stage = new StageRunner(PER_PANE_STEPS, PER_PANE_INITIAL, PER_PANE_DURATION);
	const panes = $derived([
		{ id: "A", book: book("moby"), look: stage.ph.state.looks.A },
		{ id: "B", book: book("pride"), look: stage.ph.state.looks.B },
		{ id: "C", book: book("walden"), look: stage.ph.state.looks.C },
		{ id: "D", book: book("einstein"), look: stage.ph.state.looks.D }
	] satisfies PaneSpec[]);
	const shown = $derived(stage.ph.state.looks[stage.ph.state.active] ?? DEFAULT_LOOK);
	const area = $derived(contentArea(stage.design.w, stage.design.h, false));
	const title = $derived(book(TITLES[stage.ph.state.active]).title);
</script>

<StageShell runner={stage}>
	<Window look={DEFAULT_LOOK} width={stage.design.w} height={stage.design.h} {title} bar={{ appearanceOpen: true }}>
		<Panes tree={FOUR} {area} {panes} windowLook={DEFAULT_LOOK} />
		<AppearancePopover look={shown} split={{ themes: stage.ph.state.themes, textures: false }} />
	</Window>
</StageShell>
