<script lang="ts">
  import AppearancePopover from "@/lib/overlays/AppearancePopover.svelte";
  import { bookById } from "@/lib/content";
  import { DEFAULT_LOOK } from "@/lib/palette";
  import { Scene } from "@/lib/scene.svelte";
  import { FOUR } from "@/lib/scenes/panes";
  import { PER_PANE_DURATION, PER_PANE_INITIAL, PER_PANE_STEPS, paneBookId, type PerPaneState } from "@/lib/scenes/per-pane";
  import Stage from "@/lib/stage/Stage.svelte";
  import Panes from "@/lib/window/Panes.svelte";
  import Window from "@/lib/window/Window.svelte";
  import { contentArea, type PaneSpec } from "@/lib/window/tree";
  import type { Appearance } from "@/lib/palette";

  const scene = new Scene<PerPaneState>(PER_PANE_STEPS, PER_PANE_INITIAL, PER_PANE_DURATION);
  const ph = $derived(scene.ph);
  const area = $derived(contentArea(scene.design.w, scene.design.h, false));
  const panes = $derived<PaneSpec[]>(
    (["A", "B", "C", "D"] as const)
      .map((id) => ({
        id,
        book: bookById(id === "A" ? "moby" : id === "B" ? "pride" : id === "C" ? "walden" : "einstein"),
        look: ph.state.looks[id],
      }))
      .filter((p) => p.book !== undefined),
  );
  const shown: Appearance = $derived(ph.state.looks[ph.state.active] ?? DEFAULT_LOOK);
</script>

<Stage {scene}>
  <Window
    look={DEFAULT_LOOK}
    width={scene.design.w}
    height={scene.design.h}
    title={bookById(paneBookId(ph.state.active)).title}
    appearanceOpen
  >
    <Panes tree={FOUR} {area} {panes} windowLook={DEFAULT_LOOK} />
    <AppearancePopover look={shown} split={{ themes: ph.state.themes, textures: false }} />
  </Window>
</Stage>
