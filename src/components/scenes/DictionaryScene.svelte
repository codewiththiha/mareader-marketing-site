<script lang="ts">
	import { BOOKS, MOBY } from "$lib/content";
	import { DEFAULT_LOOK } from "$lib/palette";
	import { contentArea, type PaneSpec } from "$lib/mock/geometry";
	import { ANSWER, DICT_DURATION, DICT_INITIAL, DICT_STEPS, MARKED_WORD } from "$lib/scenes/dictionary";
	import { StageRunner } from "$lib/stage/runner.svelte";
	import SelectionBar from "$components/mock/overlays/SelectionBar.svelte";
	import WordCard from "$components/mock/overlays/WordCard.svelte";
	import EpubPage from "$components/mock/window/EpubPage.svelte";
	import Panes from "$components/mock/window/Panes.svelte";
	import Window from "$components/mock/window/Window.svelte";
	import StageShell from "$components/stage/StageShell.svelte";
	import WordMeasure, { type Box } from "./WordMeasure.svelte";

	const look = DEFAULT_LOOK;
	const stage = new StageRunner(DICT_STEPS, DICT_INITIAL, DICT_DURATION);
	const moby = BOOKS[0];
	const panes: PaneSpec[] = [{ id: "A", book: moby }];
	const para3 = MOBY.paragraphs[2];
	const para4 = MOBY.paragraphs[3];
	const word = para4.slice(0, MARKED_WORD.length);
	const rest = para4.slice(MARKED_WORD.length);
	const area = $derived(contentArea(stage.design.w, stage.design.h, false));
	const mark = $derived(
		stage.ph.state.marked ? "rgba(165,138,240,0.42)" : stage.ph.state.selected ? "var(--accent-soft)" : "transparent"
	);
	const ring = $derived(stage.ph.state.marked || stage.ph.state.selected ? `0 0 0 2px ${mark}` : "none");

	let wordBox = $state<Box | null>(null);
</script>

<StageShell runner={stage}>
	<Window {look} width={stage.design.w} height={stage.design.h} title="Moby-Dick; or, The Whale">
		<Panes tree="A" {area} {panes} windowLook={look}>
			{#snippet children(_pane, r)}
				<EpubPage book={moby} width={r.w} top={72}>
					<p style="text-align:justify;hyphens:auto">{para3}</p>
					<p style="text-align:justify;hyphens:auto;text-indent:1.4em">
						<span
							data-focus="dict-word"
							style="background:{mark};border-radius:3px;box-shadow:{ring};transition:background-color 0.25s, box-shadow 0.25s"
						>
							{word}
						</span>
						{rest}
					</p>
				</EpubPage>
			{/snippet}
		</Panes>
		<WordMeasure width={stage.design.w} step={stage.ph.index} onchange={(b) => (wordBox = b)} />
		{#if wordBox && stage.ph.state.bar}
			<SelectionBar x={wordBox.x + wordBox.w / 2} y={wordBox.y + wordBox.h + 10} pressed={stage.ph.state.pressed} />
		{/if}
		{#if wordBox && stage.ph.state.card !== "none"}
			<WordCard
				at={wordBox}
				room={{ x: area.x, w: area.w }}
				answer={ANSWER}
				phase={stage.ph.state.card}
				progress={stage.ph.state.progress}
			/>
		{/if}
	</Window>
</StageShell>
