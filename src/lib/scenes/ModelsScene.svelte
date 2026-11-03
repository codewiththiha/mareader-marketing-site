<script lang="ts">
  import { bookById } from "@/lib/content";
  import { DEFAULT_LOOK, tokensOf } from "@/lib/palette";
  import { Scene } from "@/lib/scene.svelte";
  import { MODELS_DURATION, MODELS_INITIAL, MODELS_STEPS, OLLAMA_MODELS, type ModelsState } from "@/lib/scenes/models";
  import ModelsTab from "@/lib/settings/ModelsTab.svelte";
  import SettingsWindow from "@/lib/settings/SettingsWindow.svelte";
  import Stage from "@/lib/stage/Stage.svelte";
  import Panes from "@/lib/window/Panes.svelte";
  import Window from "@/lib/window/Window.svelte";
  import { contentArea, type PaneSpec } from "@/lib/window/tree";

  const scene = new Scene<ModelsState>(MODELS_STEPS, MODELS_INITIAL, MODELS_DURATION);
  const ph = $derived(scene.ph);
  const area = $derived(contentArea(scene.design.w, scene.design.h, false));
  const panes: PaneSpec[] = [{ id: "A", book: bookById("moby") }];
</script>

<Stage {scene}>
  <Window look={DEFAULT_LOOK} width={scene.design.w} height={scene.design.h} title="Moby-Dick; or, The Whale" settingsOpen>
    <Panes tree="A" {area} {panes} windowLook={DEFAULT_LOOK} />
    <SettingsWindow tab="models" title="AI models" width={scene.design.w} height={scene.design.h} dark={tokensOf(DEFAULT_LOOK).dark}>
      <ModelsTab
        models={ph.state.models}
        keys={ph.state.keys}
        typing={ph.state.typing}
        showTiles={ph.state.showTiles}
        openProvider={ph.state.openProvider}
        ollamaModels={OLLAMA_MODELS}
      />
    </SettingsWindow>
  </Window>
</Stage>
