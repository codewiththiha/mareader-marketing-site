<script lang="ts">
  import { look as lookOf, resolve, varsOf, type Site } from "$lib/looks";
  import { paneRects, SIDEBAR_W, WIN_H, WIN_W, type WinState } from "./state";
  import { CH6_CHUNKS } from "$lib/pages/texts";
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

  let { st, site, active, bake = false }: { st: WinState; site: Site; active: boolean; bake?: boolean } = $props();

  const PW = 612;
  const PW2 = PW * 2;
  const PH = 792;

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

  const tick = ticker(
    () => active && st.player,
    () => 1400,
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
      const k = pr.width / w;
      if (!k || !h) return;
      anchor = { x: (sr.left - pr.left) / k, y: (sr.top - pr.top) / k, w: sr.width / k, h: sr.height / k };
    };
    measure();
    const t = window.setTimeout(measure, 900);
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

<div class="mr-win look" class:bake style="{varsOf(chrome)};width:{WIN_W}px;height:{WIN_H}px" data-dark={chrome.dark}>
  <Pane r={P} lk={looks[0]} on title="Pride and Prejudice, by Jane Austen" count={prideCount} {low} bind:elBind={els.pane}>
    <div class="pv" style="opacity:{wide && st.pride === 'opening' ? 1 : 0};transform:translate({oX}px, {oY}px) scale({sO})">
      <OpeningSpread
        marks={st.marks}
        onSel={(el: HTMLElement) => {
          els.sel = el;
        }}
      />
    </div>
    <div class="pv" style="opacity:{wide && st.pride === 'ch6' ? 1 : 0};transform:translate(0px, 2px) scale({s6})">
      <Ch6Spread chunk={st.player ? chunk : -1} />
    </div>
    <div class="pv" style="opacity:{wide ? 0 : 1};transform:translate({x1}px, {y1}px) scale({s1})">
      <Page12 />
    </div>
    <WordCard open={st.card && !!anchor} at={anchor} roomW={P.w} />
  </Pane>
  <Pane r={rects[1]} lk={looks[1]} on={st.panes >= 2} title="CHAPTER I. Down the Rabbit-Hole" count="42 / 498" low={false} divL>
    <Alice />
  </Pane>
  <Pane r={rects[2]} lk={looks[2]} on={st.panes >= 3} title="COMMENT ON THE POEM." count="29 / 190" low={false} divL divT>
    <Raven w={rects[2].w} />
  </Pane>
  <Pane r={rects[3]} lk={looks[3]} on={st.panes >= 4} title="紅樓夢" count="87 / 7386" low={false} divL divT>
    <Chamber />
  </Pane>
  <Sidebar open={st.sidebar} />
  <TitleBar shown={st.titlebar} title="Pride and Prejudice, by Jane Austen" lit={st.lit} />
  <Popover shown={st.popover !== null} mode={st.popover ?? "themes"} sel={resolve(st.preset, site)} perPane={st.perPane} lit={st.lit} />
  <Player shown={st.player} t={track} />
  <Settings page={st.settings} lit={st.lit} voice={st.voice} {active} />
</div>
