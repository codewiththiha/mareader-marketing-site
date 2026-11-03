<script lang="ts">
	import { lerp } from "$lib/palette";
	import { contentArea, type PaneSpec } from "$lib/mock/geometry";
	import { PANES_DURATION, PANES_INITIAL, PANES_STEPS, book } from "$lib/scenes/panes";
	import { StageRunner } from "$lib/stage/runner.svelte";
	import AppearancePopover from "$components/mock/overlays/AppearancePopover.svelte";
	import Cover from "$components/mock/window/Cover.svelte";
	import Panes from "$components/mock/window/Panes.svelte";
	import Window from "$components/mock/window/Window.svelte";
	import StageShell from "$components/stage/StageShell.svelte";

	const stage = new StageRunner(PANES_STEPS, PANES_INITIAL, PANES_DURATION);
	const panes: PaneSpec[] = [
		{ id: "A", book: book("moby") },
		{ id: "B", book: book("pride") },
		{ id: "C", book: book("walden") },
		{ id: "D", book: book("einstein") }
	];
	const area = $derived(contentArea(stage.design.w, stage.design.h, true));
	const chip = $derived(
		stage.ph.state.drag
			? {
					x: lerp(stage.ph.state.drag.from.x, area.x + area.w * stage.ph.state.drag.to.x, stage.ph.state.dragP),
					y: lerp(stage.ph.state.drag.from.y, area.y + area.h * stage.ph.state.drag.to.y, stage.ph.state.dragP)
				}
			: null
	);
	const dropZone = $derived(
		stage.ph.state.drag && stage.ph.state.dragP > 0.55
			? { pane: stage.ph.state.drag.pane, side: stage.ph.state.drag.side }
			: null
	);
</script>

<StageShell runner={stage}>
	<Window
		look={stage.ph.state.look}
		width={stage.design.w}
		height={stage.design.h}
		title="Moby-Dick; or, The Whale"
		sidebar
		dragging={stage.ph.state.drag?.book ?? null}
		bar={{ appearanceOpen: stage.ph.state.popover }}
	>
		<Panes tree={stage.ph.state.tree} {area} {panes} windowLook={stage.ph.state.look} {dropZone} />
		{#if chip && stage.ph.state.drag}
			<div
				class="pointer-events-none absolute z-50 flex items-center"
				style="left:{chip.x}px;top:{chip.y}px;transform:translate(-14px, -50%);gap:8px;padding:4px 10px 4px 4px;border-radius:10px;background:var(--surface);border:1px solid var(--line);box-shadow:0 10px 28px var(--shadow)"
			>
				<Cover book={book(stage.ph.state.drag.book)} width={26} />
				<span style="font-size:12px;font-weight:500;white-space:nowrap">{book(stage.ph.state.drag.book).short}</span>
			</div>
		{/if}
		{#if stage.ph.state.popover}
			<AppearancePopover
				look={stage.ph.state.look}
				pressing={stage.ph.state.pressing}
				split={{ themes: false, textures: false }}
			/>
		{/if}
	</Window>
</StageShell>
