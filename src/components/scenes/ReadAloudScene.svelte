<script lang="ts">
	import { BOOKS, MOBY, SPOKEN } from "$lib/content";
	import { DEFAULT_LOOK } from "$lib/palette";
	import { contentArea, type PaneSpec } from "$lib/mock/geometry";
	import {
		READ_DURATION,
		READ_INITIAL,
		READ_STEPS,
		READ_TOTAL_SECS,
		SENTENCE_END,
		WORDS,
		voiceModels
	} from "$lib/scenes/readAloud";
	import { StageRunner } from "$lib/stage/runner.svelte";
	import PlayerCard from "$components/mock/overlays/PlayerCard.svelte";
	import PlayerPill from "$components/mock/overlays/PlayerPill.svelte";
	import ReadAloudTab from "$components/mock/settings/ReadAloudTab.svelte";
	import SettingsWindow from "$components/mock/settings/SettingsWindow.svelte";
	import EpubPage from "$components/mock/window/EpubPage.svelte";
	import Panes from "$components/mock/window/Panes.svelte";
	import Window from "$components/mock/window/Window.svelte";
	import StageShell from "$components/stage/StageShell.svelte";

	const look = DEFAULT_LOOK;
	const stage = new StageRunner(READ_STEPS, READ_INITIAL, READ_DURATION);
	const moby = BOOKS[0];
	const panes: PaneSpec[] = [{ id: "A", book: moby }];
	const sentenceWords = WORDS.slice(SENTENCE_END);
	const tail = MOBY.paragraphs[0].slice(SPOKEN.length + 1);
	const area = $derived(contentArea(stage.design.w, stage.design.h, false));
	const spokenSecs = $derived(Math.max(0, (stage.clock.t - 1300) / 1000));
	const left = $derived(Math.max(0, READ_TOTAL_SECS - spokenSecs));
	const leftText = $derived(`${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, "0")} left`);
	const at = $derived(Math.min(1, 0.12 + spokenSecs / READ_TOTAL_SECS));
	const py = $derived(stage.design.h - 44 - 22);
	const lit = (i: number): boolean => stage.ph.state.playing && i === stage.ph.state.word;
	const litStyle = (on: boolean): string =>
		`background:${on ? "var(--accent-soft)" : "transparent"};box-shadow:${on ? "0 0 0 2px var(--accent-soft)" : "none"};border-radius:3px;transition:background-color 0.12s, box-shadow 0.12s`;
</script>

<StageShell runner={stage}>
	{#snippet children()}
		{#snippet nowLyrics()}
			<span>
				{#each sentenceWords as w, i (i)}
					<span><span style={litStyle(lit(i + SENTENCE_END))}>{w}</span>{" "}</span>
				{/each}
			</span>
		{/snippet}
		<Window
			{look}
			width={stage.design.w}
			height={stage.design.h}
			title="Moby-Dick; or, The Whale"
			bar={{ settingsOpen: stage.ph.state.settings }}
		>
			<Panes tree="A" {area} {panes} windowLook={look}>
				{#snippet children(_pane, r)}
					<EpubPage book={moby} width={r.w} offset={stage.ph.state.offset}>
						<p data-focus="spoken" style="text-align:justify;hyphens:auto">
							{#each WORDS as w, i (i)}
								<span><span style={litStyle(lit(i))}>{w}</span>{" "}</span>
							{/each}
							{tail}
						</p>
						{#each MOBY.paragraphs.slice(1) as p, i (i)}
							<p style="text-align:justify;hyphens:auto;text-indent:1.4em">{p}</p>
						{/each}
					</EpubPage>
				{/snippet}
			</Panes>
			{#if stage.ph.state.player === "pill"}
				<PlayerPill x={area.x + area.w / 2} y={py} playing={stage.ph.state.playing} {at} left={leftText} speed="1.2×" />
			{/if}
			{#if stage.ph.state.player === "card"}
				<PlayerCard
					x={area.x + area.w / 2}
					y={stage.design.h - 224 - 22}
					book={moby}
					playing={stage.ph.state.playing}
					{at}
					left={leftText}
					speed="1.2×"
					place="Page 4 · Chapter 1, Loomings"
					narrator="Kokoro · Heart"
					lyrics={{
						before: "Call me Ishmael.",
						now: nowLyrics,
						after: "It is a way I have of driving off the spleen and regulating the circulation."
					}}
				/>
			{/if}
			{#if stage.ph.state.settings}
				<SettingsWindow tab="read-aloud" title="Read aloud" width={stage.design.w} height={stage.design.h} dark={false}>
					<ReadAloudTab
						models={voiceModels(stage.ph.state.kokoro, stage.ph.state.kokoroP)}
						engine="kokoro"
						highlight={stage.ph.state.highlight}
					/>
				</SettingsWindow>
			{/if}
		</Window>
	{/snippet}
</StageShell>
