<script lang="ts">
  import { untrack } from "svelte";
  import { bookById } from "@/lib/content";
  import { DEFAULT_LOOK } from "@/lib/palette";
  import SelectionBar from "@/lib/overlays/SelectionBar.svelte";
  import WordCard from "@/lib/overlays/WordCard.svelte";
  import { Scene } from "@/lib/scene.svelte";
  import { ANSWER, DICT_DURATION, DICT_INITIAL, DICT_STEPS, para3, rest, word, type DictState } from "@/lib/scenes/dictionary";
  import Stage from "@/lib/stage/Stage.svelte";
  import EpubPage from "@/lib/window/EpubPage.svelte";
  import Panes from "@/lib/window/Panes.svelte";
  import Window from "@/lib/window/Window.svelte";
  import { contentArea, type PaneSpec } from "@/lib/window/tree";
  import { styles } from "@/lib/style";
  import type { Box } from "@/lib/overlays/types";

  interface Measured extends Box {
    step: number;
  }

  const moby = bookById("moby");
  const scene = new Scene<DictState>(DICT_STEPS, DICT_INITIAL, DICT_DURATION);
  const ph = $derived(scene.ph);
  const area = $derived(contentArea(scene.design.w, scene.design.h, false));
  const panes: PaneSpec[] = [{ id: "A", book: moby }];
  const mark = $derived(ph.state.marked ? "rgba(165,138,240,0.42)" : ph.state.selected ? "var(--accent-soft)" : "transparent");
  const phase = $derived(ph.state.card === "none" ? null : ph.state.card);

  let host = $state<HTMLDivElement | undefined>();
  let target = $state<HTMLSpanElement | undefined>();
  let box = $state<Measured | null>(null);

  $effect(() => {
    const design = scene.design.w;
    const step = scene.index;
    const measure = () => {
      if (!host || !target) return;
      const hr = host.getBoundingClientRect();
      const s = hr.width / design || 1;
      const tr = target.getBoundingClientRect();
      const next: Measured = {
        x: (tr.left - hr.left) / s,
        y: (tr.top - hr.top) / s,
        w: tr.width / s,
        h: tr.height / s,
        step,
      };
      const seen = untrack(() => box);
      const settled =
        seen !== null && Math.abs(seen.x - next.x) < 0.5 && Math.abs(seen.y - next.y) < 0.5 && Math.abs(seen.w - next.w) < 0.5;
      if (!settled) box = next;
    };
    measure();
    const timer = window.setInterval(measure, 250);
    return () => {
      clearInterval(timer);
    };
  });
</script>

<Stage {scene}>
  <div bind:this={host}>
    <Window look={DEFAULT_LOOK} width={scene.design.w} height={scene.design.h} title="Moby-Dick; or, The Whale">
      <Panes tree="A" {area} {panes} windowLook={DEFAULT_LOOK}>
        {#snippet pane(_spec: PaneSpec, rect: { x: number; y: number; w: number; h: number })}
          <EpubPage book={moby} width={rect.w} top={72}>
            <p style={styles({ textAlign: "justify", hyphens: "auto" })}>{para3}</p>
            <p style={styles({ textAlign: "justify", hyphens: "auto", textIndent: "1.4em" })}>
              <span
                bind:this={target}
                style={styles({
                  background: mark,
                  borderRadius: 3,
                  boxShadow: ph.state.marked || ph.state.selected ? `0 0 0 2px ${mark}` : "none",
                  transition: "background-color 0.25s, box-shadow 0.25s",
                })}>{word}</span
              >{rest}
            </p>
          </EpubPage>
        {/snippet}
      </Panes>
      {#if box && ph.state.bar}
        <SelectionBar x={box.x + box.w / 2} y={box.y + box.h + 10} pressed={ph.state.pressed} />
      {/if}
      {#if box && phase}
        <WordCard at={box} room={{ x: area.x, w: area.w }} answer={ANSWER} {phase} progress={ph.state.progress} />
      {/if}
    </Window>
  </div>
</Stage>
