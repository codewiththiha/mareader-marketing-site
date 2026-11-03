<script lang="ts">
  // MockWindow — panes with themes and overlays
  import { Library, BookA, PanelLeft, Palette, Search, Ellipsis } from "@lucide/svelte";
  import { THEMES, themeVars } from "@/lib/themes";
  import type { AppTheme } from "@/lib/themes";
  import type { DocKind, Fold, Scene } from "@/lib/scenes";
  import EpubPage from "./pages/EpubPage.svelte";
  import PdfPage from "./pages/PdfPage.svelte";
  import AppearancePopover from "./popover/AppearancePopover.svelte";
  import SettingsWindow from "./settings/SettingsWindow.svelte";
  import SelectionBar from "./overlays/SelectionBar.svelte";
  import WordCard from "./overlays/WordCard.svelte";
  import PlayerCard from "./overlays/PlayerCard.svelte";

  let { scene, siteDark, W, H }: { scene: Scene; siteDark: boolean; W: number; H: number } =
    $props();

  const RECTS: Record<number, [number, number, number, number][]> = {
    1: [[0, 0, 1, 1]],
    2: [
      [0, 0, 0.5, 1],
      [0.5, 0, 0.5, 1]
    ],
    4: [
      [0, 0, 0.5, 0.5],
      [0.5, 0, 0.5, 0.5],
      [0, 0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5, 0.5]
    ]
  };
  const DEFAULT_DOCS: DocKind[] = ["epub-a", "pdf-a", "epub-b", "pdf-b"];

  function rect(layout: number, i: number) {
    if (i < layout) return RECTS[layout][i];
    return i < 2 ? RECTS[2][i] : RECTS[4][i];
  }
  function resolve(id: string, siteDark: boolean): AppTheme {
    const key =
      id === "base"
        ? siteDark
          ? "dark"
          : "light"
        : id === "warm"
          ? siteDark
            ? "night"
            : "sepia"
          : id;
    return THEMES[key];
  }
  function styleStr(obj: Record<string, string>) {
    return Object.entries(obj)
      .map(([k, v]) => `${k}:${v}`)
      .join(";");
  }

  let themes = $derived(
    Array.from({ length: 4 }, (_, i) =>
      resolve(scene.themes[i] ?? scene.themes[scene.themes.length - 1], siteDark)
    )
  );
  let docs = $derived(scene.docs ?? DEFAULT_DOCS);
  let winTheme = $derived(themes[0]);
  let split = $derived(scene.layout > 1);
  let pop = $derived(scene.popover);

  let lastPopTheme = $state<AppTheme | undefined>(undefined);
  let lastPopFolds = $state<Fold[] | undefined>(undefined);
  let lastPopPer = $state(false);
  $effect(() => {
    if (pop) {
      lastPopTheme = resolve(pop.theme, siteDark);
      lastPopFolds = pop.open;
      lastPopPer = !!pop.perPane;
    }
  });
  let popFolds = $derived(lastPopFolds ?? []);
  let popPer = $derived(lastPopPer ?? false);
  let effectivePopTheme = $derived(lastPopTheme ?? winTheme);

  let set = $derived(scene.settings);
  let lastSetTab = $state<"models" | "voices">("models");
  let lastSetStep = $state(0);
  $effect(() => {
    if (set) {
      lastSetTab = set.tab;
      lastSetStep = set.step;
    }
  });
  let setTab = $derived(lastSetTab);
  let setStep = $derived(lastSetStep);

  let tick = $state(0);
  $effect(() => {
    if (!scene.player) return;
    const id = setInterval(() => tick++, 520);
    return () => clearInterval(id);
  });
  let lit = $derived(7 + 1 + (tick % 4));
  let winStyle = $derived({ ...themeVars(winTheme), width: `${W}px`, height: `${H}px` } as Record<
    string,
    string
  >);
</script>

<div class="mk-window {set ? 'modal' : ''}" style={styleStr(winStyle)} data-focus="window">
  <div class="mk-panes" data-split={split || undefined}>
    {#each themes as t, i (i)}
      {@const hidden = i >= scene.layout}
      {@const [x, y, w, h] = rect(scene.layout, i)}
      {@const kind = docs[i]}
      {@const first = i === 0}
      {@const paneStyle = { ...themeVars(t), "--td": `${i * 110}ms` }}
      <div
        class="mk-pane-wrap {hidden ? 'hidden' : ''}"
        style="left:{x * 100}%;top:{y * 100}%;width:{w * 100}%;height:{h * 100}%"
      >
        <div class="mk-pane" style={styleStr(paneStyle)} data-focus="pane{i}">
          <div class="mk-tex {t.texture === 'paper' ? 'on' : ''}"></div>
          <div class="mk-grain {t.grain ? 'on' : ''}"></div>
          {#if kind.startsWith("epub")}
            <EpubPage
              book={kind === "epub-a" ? "a" : "b"}
              focusName="col{i}"
              mark={first
                ? scene.ai === "card"
                  ? "ai"
                  : scene.ai === "bar"
                    ? "sel"
                    : "none"
                : "none"}
              reading={first && scene.player ? [7, lit] : null}
            >
              {#if first}
                <SelectionBar open={scene.ai === "bar"} />
                <WordCard open={scene.ai === "card"} />
              {/if}
            </EpubPage>
          {:else}
            <PdfPage variant={kind === "pdf-a" ? "a" : "b"} focusName="col{i}" />
          {/if}
          {#if first}
            <PlayerCard open={!!scene.player} {tick} />
          {/if}
        </div>
      </div>
    {/each}
  </div>
  <div class="mk-bar-top {scene.bar ? 'on' : ''}" data-focus="titlebar">
    <div class="mk-lights"><i></i><i></i><i></i></div>
    <div class="mk-bar-left">
      <span class="mk-ibtn lg"><PanelLeft size={18} strokeWidth={1.75} /></span>
      <span class="mk-ibtn lg"><Library size={18} strokeWidth={1.75} /></span>
      <span class="mk-ibtn lg"><BookA size={18} strokeWidth={1.75} /></span>
    </div>
    <div class="mk-bar-title">Moby-Dick</div>
    <div class="mk-bar-right">
      <span class="mk-ibtn lg"><Search size={18} strokeWidth={1.75} /></span>
      <span class="mk-ibtn lg {pop ? 'on' : ''}"><Palette size={18} strokeWidth={1.75} /></span>
      <span class="mk-ibtn lg"><Ellipsis size={18} strokeWidth={1.75} /></span>
    </div>
  </div>
  <AppearancePopover
    open={!!pop}
    theme={effectivePopTheme}
    folds={popFolds}
    {split}
    perPane={popPer}
  />
  <SettingsWindow open={!!set} tab={setTab} step={setStep} />
</div>
