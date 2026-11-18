<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { SvelteSet } from "svelte/reactivity";
  import { fade } from "svelte/transition";
  import { look as lookOf, rgba, type Site } from "$lib/looks";
  import Window from "$lib/window/Window.svelte";
  import Caption from "./Caption.svelte";
  import TourGuide from "./TourGuide.svelte";
  import { camOf, layoutOf, maskFor } from "./layout";
  import { beatsFor, DemoClock, type Progress } from "./playback";
  import { STEPS, bakeKey, stateOf } from "./steps";
  import { canHold, sceneAt, ScrollIntent, stopsFor } from "./tour";

  let { site }: { site: Site } = $props();

  const blurs = import.meta.glob<string>("../../blur/*.webp", { eager: true, query: "?url", import: "default" });
  const scores = STEPS.map(beatsFor);
  const seen = new SvelteSet<number>();
  const intent = new ScrollIntent();
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const touchQuery = matchMedia("(pointer: coarse)");
  const device = navigator as Navigator & { deviceMemory?: number; connection?: EventTarget & { saveData?: boolean } };

  let filmEl: HTMLElement;
  let stageEl: HTMLDivElement;
  let vp = $state({ w: window.innerWidth, h: window.innerHeight });
  let active = $state(0);
  let outgoing = $state<{ index: number; ink: { i: string; m: string } } | null>(null);
  let sample = $state({ scene: 0, beat: 0 });
  let reduced = $state(motionQuery.matches);
  let touch = $state(touchQuery.matches);
  let lite = $state(false);
  let sizing = $state(true);
  let inView = $state(true);
  let foreground = $state(!document.hidden);
  let motion = $state<Progress | null>(null);
  let playback = $state.raw<DemoClock | null>(null);
  let pending: number | null = null;
  let origin = 0;
  let settleTimer = 0;
  let captionTimer = 0;
  let enteredAt = 0;

  const stops = $derived(stopsFor(vp.h, STEPS.length));
  const end = $derived(stops[STEPS.length]);
  const layouts = $derived(STEPS.map((s) => layoutOf(s, vp.w, vp.h)));
  const L = $derived(layouts[active]);
  const step = $derived(STEPS[active]);
  const beat = $derived(sample.scene === active ? sample.beat : 0);
  const frame = $derived(reduced ? (step.still ?? step.frames.length - 1) : step.beats ? 0 : beat);
  const st = $derived(stateOf(active, frame));
  const camera = $derived(camOf(L));
  const transform = $derived(`translate(${camera.x.toFixed(2)}px, ${camera.y.toFixed(2)}px) scale(${camera.scale.toFixed(5)})`);
  const lensLook = $derived(step.lens === "chrome" ? lookOf(st.chrome, site) : lookOf(st.looks[0], site));
  const blur = $derived(step.zoom && !lite ? blurs[`../../blur/${bakeKey(active, frame, site)}.webp`] : undefined);
  const tone = $derived(rgba(lensLook.p, blur ? (lensLook.dark ? 0.34 : 0.26) : 0.9));
  const ink = $derived(
    step.zoom
      ? lensLook.dark
        ? { i: "#f6efe4", m: "rgba(246,239,228,.80)" }
        : { i: "#1c1610", m: "rgba(28,22,16,.74)" }
      : { i: "var(--ink)", m: "var(--muted)" },
  );

  function clearHint() {
    window.clearTimeout(settleTimer);
    pending = null;
    motion = null;
  }

  function activate(index: number) {
    clearHint();
    if (index === active) return;
    window.clearTimeout(captionTimer);
    outgoing = reduced ? null : { index: active, ink };
    active = index;
    enteredAt = performance.now();
    captionTimer = window.setTimeout(() => (outgoing = null), 240);
  }

  function hint(clock: DemoClock, rush?: number) {
    if (rush) clock.rush(rush);
    if (!motion || rush) motion = clock.progress;
  }

  function readScroll(interactive: boolean) {
    const offset = window.scrollY - origin;
    const now = performance.now();
    const target = sceneAt(offset, stops);
    const { delta, fast } = intent.read(offset, now, vp.h);
    const clock = playback;
    const firstPlay = interactive && !reduced && inView && foreground && !seen.has(active) && clock?.playing;

    if (!interactive || target < active || offset >= end) {
      activate(target);
    } else if (target > active) {
      const hold = canHold(active, target, offset, stops, fast);
      if (hold && pending === target) return;
      if (hold && clock && firstPlay) {
        pending = target;
        hint(clock, 780);
      } else {
        if (clock && firstPlay && fast) seen.add(active);
        activate(target);
      }
    } else if (pending !== null || delta < -2) {
      clearHint();
    } else if (clock && firstPlay && delta > 0 && now - enteredAt > 240) {
      if (fast) {
        if (!motion || clock.progress.remaining > 450) hint(clock, 450);
      } else {
        hint(clock);
      }
    }
  }

  function skip(event?: MouseEvent) {
    if (event?.metaKey || event?.ctrlKey || event?.altKey || event?.shiftKey) return;
    const destination = document.getElementById("tour-end");
    if (!destination) return;
    event?.preventDefault();
    clearHint();
    destination.focus({ preventScroll: true });
    destination.scrollIntoView({ block: "start", behavior: "instant" });
  }

  function next() {
    seen.add(active);
    const index = active + 1;
    if (index === STEPS.length) {
      skip();
      return;
    }
    const at = stops[index] + 1;
    intent.reset(at, performance.now());
    window.scrollTo({ top: origin + at, behavior: "instant" });
    activate(index);
  }

  onMount(() => {
    let raf = 0;
    let resizeTimer = 0;
    const policy = () => {
      reduced = motionQuery.matches;
      touch = touchQuery.matches;
      lite =
        reduced ||
        device.connection?.saveData === true ||
        (device.deviceMemory ?? 8) <= 4 ||
        (device.hardwareConcurrency || 8) <= 4 ||
        (touch && vp.w < 1000);
      if (lite) document.documentElement.dataset.effects = "lite";
      else delete document.documentElement.dataset.effects;
      if (reduced && pending !== null) readScroll(false);
      if (reduced) clearHint();
    };
    const measure = () => {
      const w = stageEl.clientWidth;
      const h = stageEl.clientHeight;
      if (!w || !h) return;
      origin = filmEl.getBoundingClientRect().top + window.scrollY;
      if (w !== vp.w || h !== vp.h) {
        sizing = true;
        vp = { w, h };
      }
      policy();
      intent.reset(window.scrollY - origin, performance.now());
      readScroll(false);
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => (sizing = false), 130);
    };
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          readScroll(true);
        });
    };
    const visibility = () => {
      foreground = !document.hidden;
      if (foreground && sceneAt(window.scrollY - origin, stops) !== active) readScroll(false);
    };
    const resize = new ResizeObserver(measure);
    resize.observe(stageEl);
    const intersection = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting && entry.intersectionRatio >= 0.05), {
      threshold: 0.05,
    });
    intersection.observe(stageEl);
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    motionQuery.addEventListener("change", policy);
    touchQuery.addEventListener("change", policy);
    device.connection?.addEventListener("change", policy);
    return () => {
      resize.disconnect();
      intersection.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", visibility);
      motionQuery.removeEventListener("change", policy);
      touchQuery.removeEventListener("change", policy);
      device.connection?.removeEventListener("change", policy);
      delete document.documentElement.dataset.effects;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(settleTimer);
      window.clearTimeout(captionTimer);
    };
  });

  $effect(() => {
    const contrast = inView && !!step.zoom && L.side !== "bottom" && lensLook.dark !== (site === "dark");
    document.documentElement.toggleAttribute("data-tour-contrast", contrast);
    return () => {
      document.documentElement.removeAttribute("data-tour-contrast");
    };
  });

  $effect(() => {
    const i = active;
    const ends = scores[i];
    sample = { scene: i, beat: 0 };
    if (reduced || !ends.length) {
      playback = null;
      return;
    }
    const clock = new DemoClock(
      ends,
      (beat) => (sample = { scene: i, beat }),
      () => {
        seen.add(i);
        if (!motion) return;
        motion = { ratio: 1, remaining: 0 };
        settleTimer = window.setTimeout(
          () => {
            if (pending !== null) activate(pending);
            else clearHint();
          },
          pending === null ? 260 : 150,
        );
      },
    );
    playback = clock;
    return () => {
      clock.pause();
    };
  });

  $effect(() => {
    const clock = playback;
    if (inView && foreground) {
      clock?.resume();
      if (clock?.playing && untrack(() => motion !== null)) motion = clock.progress;
    } else {
      clock?.pause();
      if (untrack(() => motion !== null)) clearHint();
    }
  });
</script>

<section
  bind:this={filmEl}
  id="tour"
  class="film"
  data-film
  data-stops={JSON.stringify(stops)}
  style:height="{vp.h + end}px"
  aria-label="Mareader tour"
>
  <div
    bind:this={stageEl}
    class="stage"
    class:sizing
    class:lite
    class:rushing={motion !== null && motion.remaining < 900}
    data-scene={step.id}
    data-beat={beat}
  >
    <div class="cam" style:transform aria-hidden="true" inert>
      <div class="win-frame">
        <Window {st} {site} tick={reduced ? 0 : beat} running={inView && foreground && !reduced} />
      </div>
    </div>

    {#each step.zoom ? [L.side] : [] as side (side)}
      {@const mask = lite ? undefined : maskFor(side, L, vp.w, vp.h)}
      {@const gradient = lite ? maskFor(side, L, vp.w, vp.h, `color-mix(in srgb, ${lensLook.p} 90%, var(--bg))`) : undefined}
      <div
        class="lens"
        class:flat={lite}
        style:background-image={gradient}
        style:mask-image={mask}
        style:-webkit-mask-image={mask}
        aria-hidden="true"
        transition:fade={{ duration: reduced ? 0 : lite ? 210 : 440 }}
      >
        {#if blur}<img class="lens-img lens-cam" src={blur} alt="" decoding="async" style:transform />{/if}
        {#if !lite}
          <div class="lens-tone" style:background={tone}></div>
          <div class="lens-grain"></div>
        {/if}
      </div>
    {/each}

    <div id="tour-scene">
      {#each outgoing ? [outgoing.index, active] : [active] as i (i)}
        <Caption step={STEPS[i]} L={layouts[i]} on={i === active} ink={i === active ? ink : (outgoing?.ink ?? ink)} />
      {/each}
    </div>

    <TourGuide
      index={active}
      total={STEPS.length}
      {touch}
      {motion}
      {reduced}
      nextLabel={active === STEPS.length - 1 ? "Explore more after the tour" : `Next scene: ${STEPS[active + 1].title}`}
      onnext={next}
      onskip={skip}
    />
  </div>
</section>
