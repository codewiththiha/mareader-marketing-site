<script lang="ts">
  import { look as lookOf, rgba, type Site } from "$lib/looks";
  import Window from "$lib/window/Window.svelte";
  import Caption from "./Caption.svelte";
  import { Camera } from "./camera";
  import { camOf, layoutOf, maskFor, type Layout, type Side } from "./layout";
  import { STEPS, bakeKey, stateOf } from "./steps";

  let { site }: { site: Site } = $props();

  const BLURS = import.meta.glob<string>("../../blur/*.webp", { eager: true, query: "?url", import: "default" });
  const blurUrl = (key: string): string | undefined => BLURS[`../../blur/${key}.webp`];

  const STEP_VH = 92;
  const SIDES: Side[] = ["left", "right", "top", "bottom"];

  let filmEl = $state(null as HTMLElement | null);
  let stageEl = $state(null as HTMLDivElement | null);
  let camEl = $state(null as HTMLDivElement | null);
  let lensEls = $state([] as (HTMLDivElement | null)[]);
  let camera = null as Camera | null;
  let snapNext = true;

  let vp = $state({ w: window.innerWidth, h: window.innerHeight });
  let active = $state(0);
  let tl = $state({ step: 0, frame: 0 });
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const weights = STEPS.map((s) => s.weight ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);
  const bounds = weights.reduce<number[]>((acc, w) => [...acc, acc[acc.length - 1] + w / total], [0]);

  $effect(() => {
    const el = stageEl;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      snapNext = true;
      vp = { w: el.clientWidth, h: el.clientHeight };
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  });

  $effect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = filmEl;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = el.offsetHeight - window.innerHeight;
      const p = Math.max(0, Math.min(0.99999, -r.top / Math.max(1, span)));
      let i = 0;
      while (i < STEPS.length - 1 && p >= bounds[i + 1]) i++;
      active = i;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  });

  $effect(() => {
    const s = STEPS[active];
    tl = { step: active, frame: 0 };
    let f = 0;
    let t = 0;
    const next = () => {
      const last = f >= s.frames.length - 1;
      if (last && !s.loop) return;
      const dur = Array.isArray(s.ms) ? (s.ms[f] ?? 1700) : (s.ms ?? 1700);
      t = window.setTimeout(
        () => {
          f = last ? (s.loopFrom ?? 0) : f + 1;
          tl = { step: active, frame: f };
          next();
        },
        dur * (reduced ? 1.6 : 1),
      );
    };
    next();
    return () => {
      window.clearTimeout(t);
    };
  });

  const layouts = $derived(STEPS.map((s) => layoutOf(s, vp.w, vp.h)));
  const L = $derived(layouts[active]);
  const step = $derived(STEPS[active]);
  const frame = $derived(tl.step === active ? tl.frame : 0);
  const st = $derived(stateOf(active, frame));

  $effect(() => {
    const target = camOf(L);
    if (!camera) {
      camera = new Camera(target, () => [camEl, ...lensEls].filter(Boolean) as HTMLElement[]);
      camera.to(target, true);
      snapNext = false;
      return;
    }
    camera.to(target, snapNext || reduced);
    snapNext = false;
  });

  const lensLook = $derived(step.lens === "chrome" ? lookOf(st.chrome, site) : lookOf(st.looks[0], site));
  const url = $derived(step.zoom ? blurUrl(bakeKey(active, frame, site)) : undefined);
  let bag: string[] = [];
  const recent = $derived.by(() => {
    if (url && bag[bag.length - 1] !== url) bag = [...bag.filter((u) => u !== url), url].slice(-3);
    return bag;
  });
  const tone = $derived(rgba(lensLook.p, url ? (lensLook.dark ? 0.34 : 0.26) : 0.9));
  const ink = $derived(
    step.zoom
      ? lensLook.dark
        ? { i: "#f6efe4", m: "rgba(246,239,228,.80)" }
        : { i: "#1c1610", m: "rgba(28,22,16,.74)" }
      : { i: "var(--ink)", m: "var(--muted)" },
  );

  let bagL: Partial<Record<Side, Layout>> = {};
  const lastLayout = $derived.by(() => {
    bagL[L.side] = L;
    return bagL;
  });
</script>

<section bind:this={filmEl} id="tour" class="film" data-film data-bounds={JSON.stringify(bounds)} style="height: {total * STEP_VH + 100}vh">
  <div bind:this={stageEl} class="stage">
    <div bind:this={camEl} class="cam" aria-hidden="true">
      <div class="win-frame">
        <Window {st} {site} active />
      </div>
    </div>

    {#each SIDES as side, i (side)}
      {@const fit = (side === "left" || side === "right") === L.landscape}
      {#if fit}
        {@const show = !!step.zoom && L.side === side}
        {@const LL = show ? L : (lastLayout[side] ?? L)}
        {@const mask = maskFor(side, LL, vp.w, vp.h)}
        <div class="lens" style:opacity={show ? 1 : 0} style:-webkit-mask-image={mask} style:mask-image={mask} aria-hidden="true">
          <div class="lens-base"></div>
          <div bind:this={lensEls[i]} class="lens-cam">
            {#each recent as u (u)}
              <img src={u} alt="" class="lens-img" style:opacity={u === url ? 1 : 0} />
            {/each}
          </div>
          <div class="lens-tone" style:background={tone}></div>
          <div class="lens-grain"></div>
        </div>
      {/if}
    {/each}

    {#each STEPS as s, i (s.id)}
      <Caption step={s} L={layouts[i]} on={i === active} ink={i === active ? ink : { i: "var(--ink)", m: "var(--muted)" }} />
    {/each}
  </div>
</section>
