<script lang="ts">
  import AppearancePopover from "@/lib/overlays/AppearancePopover.svelte";
  import { bookById } from "@/lib/content";
  import { Scene } from "@/lib/scene.svelte";
  import { PANES_DURATION, PANES_INITIAL, PANES_SPECS, PANES_STEPS, dragChip, type PanesState } from "@/lib/scenes/panes";
  import Stage from "@/lib/stage/Stage.svelte";
  import Cover from "@/lib/window/Cover.svelte";
  import Panes from "@/lib/window/Panes.svelte";
  import Window from "@/lib/window/Window.svelte";
  import { contentArea } from "@/lib/window/tree";
  import { styles } from "@/lib/style";

  const scene = new Scene<PanesState>(PANES_STEPS, PANES_INITIAL, PANES_DURATION);
  const ph = $derived(scene.ph);
  const area = $derived(contentArea(scene.design.w, scene.design.h, true));
  const chip = $derived(ph.state.drag ? { ...dragChip(ph.state.drag, area, ph.state.dragP), book: ph.state.drag.book } : null);
  const dropZone = $derived(ph.state.drag && ph.state.dragP > 0.55 ? { pane: ph.state.drag.pane, side: ph.state.drag.side } : null);
</script>

<Stage {scene}>
  <Window
    look={ph.state.look}
    width={scene.design.w}
    height={scene.design.h}
    title="Moby-Dick; or, The Whale"
    sidebar
    dragging={ph.state.drag?.book ?? null}
    appearanceOpen={ph.state.popover}
  >
    <Panes tree={ph.state.tree} {area} panes={PANES_SPECS} windowLook={ph.state.look} {dropZone} />
    {#if chip}
      <div
        class="pointer-events-none absolute z-50 flex items-center"
        style={styles({
          left: chip.x,
          top: chip.y,
          transform: "translate(-14px, -50%)",
          gap: 8,
          padding: "4px 10px 4px 4px",
          borderRadius: 10,
          background: "var(--surface)",
          border: "1px solid var(--line)",
          boxShadow: "0 10px 28px var(--shadow)",
        })}
      >
        <Cover book={bookById(chip.book)} width={26} />
        <span style={styles({ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" })}>{bookById(chip.book).short}</span>
      </div>
    {/if}
    {#if ph.state.popover}
      <AppearancePopover look={ph.state.look} pressing={ph.state.pressing} split={{ themes: false, textures: false }} />
    {/if}
  </Window>
</Stage>
