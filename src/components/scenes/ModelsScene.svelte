<script lang="ts">
	import { BOOKS } from "$lib/content";
	import { DEFAULT_LOOK, tokensOf } from "$lib/palette";
	import { contentArea, type PaneSpec } from "$lib/mock/geometry";
	import { MODELS_DURATION, MODELS_INITIAL, MODELS_STEPS, OLLAMA_MODELS } from "$lib/scenes/models";
	import { StageRunner } from "$lib/stage/runner.svelte";
	import ModelsTab from "$components/mock/settings/ModelsTab.svelte";
	import SettingsWindow from "$components/mock/settings/SettingsWindow.svelte";
	import Panes from "$components/mock/window/Panes.svelte";
	import Window from "$components/mock/window/Window.svelte";
	import StageShell from "$components/stage/StageShell.svelte";

	const look = DEFAULT_LOOK;
	const stage = new StageRunner(MODELS_STEPS, MODELS_INITIAL, MODELS_DURATION);
	const panes: PaneSpec[] = [{ id: "A", book: BOOKS[0] }];
	const area = $derived(contentArea(stage.design.w, stage.design.h, false));
</script>

<StageShell runner={stage}>
	<Window
		{look}
		width={stage.design.w}
		height={stage.design.h}
		title="Moby-Dick; or, The Whale"
		bar={{ settingsOpen: true }}
	>
		<Panes tree="A" {area} {panes} windowLook={look} />
		<SettingsWindow
			tab="models"
			title="AI models"
			width={stage.design.w}
			height={stage.design.h}
			dark={tokensOf(look).dark}
		>
			<ModelsTab
				models={stage.ph.state.models}
				keys={stage.ph.state.keys}
				typing={stage.ph.state.typing}
				showTiles={stage.ph.state.showTiles}
				openProvider={stage.ph.state.openProvider}
				ollamaModels={OLLAMA_MODELS}
			/>
		</SettingsWindow>
	</Window>
</StageShell>
