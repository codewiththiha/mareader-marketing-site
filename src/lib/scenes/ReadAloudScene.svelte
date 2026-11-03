<script lang="ts">
  import { bookById } from "@/lib/content";
  import { DEFAULT_LOOK } from "@/lib/palette";
  import PlayerCard from "@/lib/overlays/PlayerCard.svelte";
  import PlayerPill from "@/lib/overlays/PlayerPill.svelte";
  import { Scene } from "@/lib/scene.svelte";
  import ReadAloudTab from "@/lib/settings/ReadAloudTab.svelte";
  import SettingsWindow from "@/lib/settings/SettingsWindow.svelte";
  import {
    READ_DURATION,
    READ_INITIAL,
    READ_STEPS,
    READ_TOTAL,
    SENTENCE_END,
    SENTENCE_WORDS,
    SPACE,
    TAIL,
    TAIL_PARAGRAPHS,
    WORDS,
    type ReadState,
  } from "@/lib/scenes/read-aloud";
  import Stage from "@/lib/stage/Stage.svelte";
  import { styles } from "@/lib/style";
  import EpubPage from "@/lib/window/EpubPage.svelte";
  import Panes from "@/lib/window/Panes.svelte";
  import Window from "@/lib/window/Window.svelte";
  import { contentArea, type PaneSpec, type Rect } from "@/lib/window/tree";
  import type { VoiceModel } from "@/lib/settings/types";

  const moby = bookById("moby");
  const scene = new Scene<ReadState>(READ_STEPS, READ_INITIAL, READ_DURATION);
  const ph = $derived(scene.ph);
  const area = $derived(contentArea(scene.design.w, scene.design.h, false));
  const panes: PaneSpec[] = [{ id: "A", book: moby }];

  const spokenSecs = $derived(Math.max(0, (scene.t - 1300) / 1000));
  const remaining = $derived(Math.max(0, READ_TOTAL - spokenSecs));
  const leftText = $derived(`${Math.floor(remaining / 60)}:${String(Math.floor(remaining % 60)).padStart(2, "0")} left`);
  const at = $derived(Math.min(1, 0.12 + spokenSecs / READ_TOTAL));
  const pillY = $derived(scene.design.h - 44 - 22);
  const cardY = $derived(scene.design.h - 224 - 22);

  const lit = (i: number) => ph.state.playing && i === ph.state.word;
  const litStyle = (on: boolean) =>
    styles({
      background: on ? "var(--accent-soft)" : "transparent",
      boxShadow: on ? "0 0 0 2px var(--accent-soft)" : "none",
      borderRadius: 3,
      transition: "background-color 0.12s, box-shadow 0.12s",
    });

  const models = $derived<VoiceModel[]>([
    {
      id: "kokoro",
      name: "Kokoro",
      about: "Natural voices in English, Spanish, Italian, Portuguese, French, Hindi and Chinese from a small model, 82 million parameters",
      size: "Tiny 92 MB · Full 327 MB",
      state: ph.state.kokoro,
      progress: ph.state.kokoroP,
      voices: "54 voices",
    },
    { id: "piper", name: "Piper", about: "Quick, clear English voices; each is a small model of its own", size: "24 MB", state: "offer" },
    {
      id: "kitten",
      name: "Kitten",
      about: "Light English voices from tiny models, 15 to 80 million parameters",
      size: "25 MB",
      state: "offer",
    },
    {
      id: "phonon",
      name: "Phonon",
      about: "Natural English voices from a 31 million parameter model; reads numbers, money and addresses as written",
      size: "64.5 MB",
      state: "offer",
    },
  ]);
</script>

<Stage {scene}>
  <Window
    look={DEFAULT_LOOK}
    width={scene.design.w}
    height={scene.design.h}
    title="Moby-Dick; or, The Whale"
    settingsOpen={ph.state.settings}
  >
    <Panes tree="A" {area} {panes} windowLook={DEFAULT_LOOK}>
      {#snippet pane(_spec: PaneSpec, rect: Rect)}
        <EpubPage book={moby} width={rect.w} offset={ph.state.offset}>
          <p data-focus="spoken" style={styles({ textAlign: "justify", hyphens: "auto" })}>
            {#each WORDS as w, i (i)}<span><span style={litStyle(lit(i))}>{w}</span>{SPACE}</span>{/each}
            {TAIL}
          </p>
          {#each TAIL_PARAGRAPHS as p, i (i)}
            <p style={styles({ textAlign: "justify", hyphens: "auto", textIndent: "1.4em" })}>{p}</p>
          {/each}
        </EpubPage>
      {/snippet}
    </Panes>
    {#if ph.state.player === "pill"}
      <PlayerPill x={area.x + area.w / 2} y={pillY} playing={ph.state.playing} {at} left={leftText} speed="1.2×" />
    {/if}
    {#if ph.state.player === "card"}
      <PlayerCard
        x={area.x + area.w / 2}
        y={cardY}
        book={moby}
        playing={ph.state.playing}
        {at}
        left={leftText}
        speed="1.2×"
        place="Page 4 · Chapter 1, Loomings"
        narrator="Kokoro · Heart"
        before="Call me Ishmael."
        after="It is a way I have of driving off the spleen and regulating the circulation."
      >
        {#snippet now()}
          <span>
            {#each SENTENCE_WORDS as w, i (i)}<span><span style={litStyle(lit(i + SENTENCE_END))}>{w}</span>{SPACE}</span>{/each}
          </span>
        {/snippet}
      </PlayerCard>
    {/if}
    {#if ph.state.settings}
      <SettingsWindow tab="read-aloud" title="Read aloud" width={scene.design.w} height={scene.design.h} dark={false}>
        <ReadAloudTab {models} engine="kokoro" highlight={ph.state.highlight} />
      </SettingsWindow>
    {/if}
  </Window>
</Stage>
