<script lang="ts">
  import AppearancePopover from "@/lib/overlays/AppearancePopover.svelte";
  import { Scene } from "@/lib/scene.svelte";
  import { THEMES_DURATION, THEMES_INITIAL, THEMES_PANES, THEMES_STEPS, THEMES_TREE, type ThemesState } from "@/lib/scenes/themes";
  import Stage from "@/lib/stage/Stage.svelte";
  import Panes from "@/lib/window/Panes.svelte";
  import Window from "@/lib/window/Window.svelte";
  import { contentArea } from "@/lib/window/tree";

  const scene = new Scene<ThemesState>(THEMES_STEPS, THEMES_INITIAL, THEMES_DURATION);
  const ph = $derived(scene.ph);
  const area = $derived(contentArea(scene.design.w, scene.design.h, false));
</script>

<Stage {scene}>
  <Window
    look={ph.state.look}
    width={scene.design.w}
    height={scene.design.h}
    title="Moby-Dick; or, The Whale"
    appearanceOpen={ph.state.popover}
  >
    <Panes tree={THEMES_TREE} {area} panes={THEMES_PANES} windowLook={ph.state.look} />
    {#if ph.state.popover}
      <AppearancePopover look={ph.state.look} pressing={ph.state.pressing} />
    {/if}
  </Window>
</Stage>
