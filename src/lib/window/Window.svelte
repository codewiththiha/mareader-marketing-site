<script lang="ts">
  import { look as lookOf, resolve, varsOf, type Site } from "$lib/looks";
  import { paneRects, SIDEBAR_W, WIN_H, WIN_W, type WinState } from "./state";
  import { CH6_CHUNKS } from "$lib/pages/texts";
  import { keep } from "$lib/utils/keep.svelte";
  import { ticker } from "$lib/utils/ticker.svelte";
  import Pane from "./Pane.svelte";
  import OpeningSpread from "$lib/pages/OpeningSpread.svelte";
  import Page12 from "$lib/pages/Page12.svelte";
  import Ch6Spread from "$lib/pages/Ch6Spread.svelte";
  import Alice from "$lib/pages/Alice.svelte";
  import Raven from "$lib/pages/Raven.svelte";
  import Chamber from "$lib/pages/Chamber.svelte";
  import Player from "$lib/chrome/Player.svelte";
  import Popover from "$lib/chrome/Popover.svelte";
  import Settings from "$lib/chrome/Settings.svelte";
  import Sidebar from "$lib/chrome/Sidebar.svelte";
  import TitleBar from "$lib/chrome/TitleBar.svelte";
  import WordCard from "$lib/chrome/WordCard.svelte";
  import type { Anchor } from "$lib/chrome/anchor";

  let {
    st,
    site,
    active,
    speed = 1,
    bake = false,
  }: { st: WinState; site: Site; active: boolean; speed?: number; bake?: boolean } = $props();

  const PW = 612;
  const PW2 = PW * 2;
  const PH = 792;
  const HALF = Math.round(WIN_W / 2);
  const RW = WIN_W - HALF;
  const QH = WIN_H / 2;

  const chrome = $derived(lookOf(st.chrome, site));
  const looks = $derived(st.looks.map((l) => lookOf(l, site)));
  const rects = $derived(paneRects(st.panes, st.sidebar ? SIDEBAR_W : 0));
  const P = $derived(rects[0]);

  const wide = $derived(P.w > 1000);
  const sO = $derived(Math.min(P.w / PW2, P.h / PH));
  const oX = $derived((P.w - PW2 * sO) / 2);
  const oY = $derived((P.h - PH * sO) / 2);
  const s6 = $derived(P.w / PW2);
  const s1 = $derived(Math.min(P.h / PH, P.w / PW));
  const x1 = $derived((P.w - PW * s1) / 2);
  const y1 = $derived((P.h - PH * s1) / 2);

  const showOpen = keep(() => wide && st.pride === "opening", 520);
  const showCh6 = keep(() => wide && st.pride === "ch6", 520);
  const showP12 = keep(() => !wide, 520);
  const showA = keep(() => st.panes >= 2, 820);
  const showV = keep(() => st.panes >= 3, 820);
  const showC = keep(() => st.panes >= 4, 820);
  const showSb = keep(() => st.sidebar, 600);
  const showTb = keep(() => st.titlebar, 420);
  const showPop = keep(() => st.popover !== null, 340);
  const showPl = keep(() => st.player, 420);
  const showSt = keep(() => st.settings !== null, 440);
  const showWc = keep(() => st.card, 280);

  const tick = ticker(
    () => active && st.player,
    () => 1400 / speed,
  );
  const chunk = $derived(bake ? 6 : 3 + (tick() % (CH6_CHUNKS - 3)));
  const track = $derived(bake ? 34 : Math.min(96, 30 + tick() * 2.2));

  const els = $state({ pane: null as HTMLDivElement | null, sel: null as HTMLElement | null });
  let anchor = $state(null as Anchor | null);
  $effect(() => {
    if (!st.card) return;
    const w = P.w;
    const h = P.h;
    const measure = () => {
      const p = els.pane;
      const s = els.sel;
      if (p === null || s === null) return;
      const pr: DOMRect = p.getBoundingClientRect();
      const sr: DOMRect = s.getBoundingClientRect();
      const k = pr.width / WIN_W;
      if (!k || !w || !h) return;
      anchor = { x: (sr.left - pr.left) / k, y: (sr.top - pr.top) / k, w: sr.width / k, h: sr.height / k };
    };
    measure();
    const t = window.setTimeout(measure, Math.round(700 / speed));
    const fonts = document.fonts as FontFaceSet | undefined;
    if (fonts) void fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  });

  const prideCount = $derived(wide ? (st.pride === "ch6" ? "14 / 234" : "2 / 234") : "12 / 234");
  const low = $derived(st.titlebar && st.panes === 1 && !st.popover);
</script>

<div class="mr-win look" class:bake style="{varsOf(chrome)};--rate:{speed};width:{WIN_W}px;height:{WIN_H}px" data-dark={chrome.dark}>
  <Pane
    r={P}
    boxW={WIN_W}
    boxH={WIN_H}
    lk={looks[0]}
    on
    title="Pride and Prejudice, by Jane Austen"
    count={prideCount}
    {low}
    bind:elBind={els.pane}
  >
    {#if showOpen()}
      <div class="pv" style="opacity:{wide && st.pride === 'opening' ? 1 : 0};transform:translate3d({oX}px, {oY}px, 0) scale({sO})">
        <OpeningSpread
          marks={st.marks}
          onSel={(el: HTMLElement) => {
            els.sel = el;
          }}
        />
      </div>
    {/if}
    {#if showCh6()}
      <div class="pv" style="opacity:{wide && st.pride === 'ch6' ? 1 : 0};transform:translate3d(0px, 2px, 0) scale({s6})">
        <Ch6Spread chunk={st.player ? chunk : -1} />
      </div>
    {/if}
    {#if showP12()}
      <div class="pv" style="opacity:{wide ? 0 : 1};transform:translate3d({x1}px, {y1}px, 0) scale({s1})">
        <Page12 />
      </div>
    {/if}
    {#if showWc()}
      <WordCard open={st.card && !!anchor} at={anchor} roomW={P.w} />
    {/if}
  </Pane>
  {#if showA()}
    <Pane
      r={rects[1]}
      boxW={RW}
      boxH={WIN_H}
      lk={looks[1]}
      on={st.panes >= 2}
      title="CHAPTER I. Down the Rabbit-Hole"
      count="42 / 498"
      low={false}
      divL
      enter="r"
    >
      <Alice />
    </Pane>
  {/if}
  {#if showV()}
    <Pane
      r={rects[2]}
      boxW={RW}
      boxH={QH}
      lk={looks[2]}
      on={st.panes >= 3}
      title="COMMENT ON THE POEM."
      count="29 / 190"
      low={false}
      divL
      divT
      enter="b"
    >
      <Raven w={rects[2].w} />
    </Pane>
  {/if}
  {#if showC()}
    <Pane
      r={rects[3]}
      boxW={RW / 2}
      boxH={QH}
      lk={looks[3]}
      on={st.panes >= 4}
      title="紅樓夢"
      count="87 / 7386"
      low={false}
      divL
      divT
      enter="r"
    >
      <Chamber />
    </Pane>
  {/if}
  {#if showSb()}<Sidebar open={st.sidebar} />{/if}
  {#if showTb()}<TitleBar shown={st.titlebar} title="Pride and Prejudice, by Jane Austen" lit={st.lit} />{/if}
  {#if showPop()}
    <Popover shown={st.popover !== null} mode={st.popover ?? "themes"} sel={resolve(st.preset, site)} perPane={st.perPane} lit={st.lit} />
  {/if}
  {#if showPl()}<Player shown={st.player} t={track} />{/if}
  {#if showSt()}<Settings page={st.settings} lit={st.lit} voice={st.voice} {active} {speed} />{/if}
</div>
