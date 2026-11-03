<script lang="ts">
  import { bookById } from "@/lib/content";
  import { DEFAULT_LOOK, presetLook, type Appearance } from "@/lib/palette";
  import { Scene } from "@/lib/scene.svelte";
  import { styles } from "@/lib/style";
  import { contentArea } from "@/lib/window/tree";
  import Panes from "@/lib/window/Panes.svelte";
  import Window from "@/lib/window/Window.svelte";
  import type { PaneSpec } from "@/lib/window/tree";

  const LOOK_EACH = 3800;
  const LOOKS: Appearance[] = [
    DEFAULT_LOOK,
    presetLook("sepia"),
    presetLook("night"),
    presetLook("parchment"),
    presetLook("cinema"),
    presetLook("green"),
  ];
  const PANES: PaneSpec[] = [
    { id: "A", book: bookById("moby") },
    { id: "B", book: bookById("einstein") },
  ];

  const scene = new Scene<Appearance>([], DEFAULT_LOOK, LOOKS.length * LOOK_EACH, {
    hold: 0,
    threshold: 0.2,
    designs: { desktop: { w: 1120, h: 620 }, compact: { w: 760, h: 560 } },
  });

  const look = $derived(LOOKS[Math.min(LOOKS.length - 1, Math.floor(scene.t / LOOK_EACH))] ?? DEFAULT_LOOK);
  const area = $derived(contentArea(scene.design.w, scene.design.h, false));
</script>

<div
  use:scene.attach
  class="relative w-full overflow-hidden rounded-[14px]"
  style={styles({
    height: scene.design.h * scene.fit,
    boxShadow: "0 0 0 1px var(--line), 0 40px 80px -30px rgba(0,0,0,0.45)",
  })}
>
  <div
    class="absolute top-0 left-0"
    style={styles({ width: scene.design.w, height: scene.design.h, transform: `scale(${scene.fit})`, transformOrigin: "0 0" })}
  >
    <Window {look} width={scene.design.w} height={scene.design.h} title="Moby-Dick; or, The Whale">
      <Panes tree={scene.compact ? "A" : { axis: "h", ratio: 0.5, a: "A", b: "B" }} {area} panes={PANES} windowLook={look} />
    </Window>
  </div>
</div>
