<script lang="ts">
  import Window from "$lib/window/Window.svelte";
  import Caption from "./Caption.svelte";
  import { Camera } from "./camera";
  import { camOf, layoutOf, veilFor } from "./layout";
  import { STEPS, needsOf, stateOf } from "./steps";
  import { lite } from "$lib/utils/power";
  import type { Site } from "$lib/looks";

  let { site }: { site: Site } = $props();

  const STEP_VH = 92;
  const N = STEPS.length;
  const IDLE = 2400;
  const pad = (v: number) => String(v).padStart(2, "0");

  let filmEl = $state(null as HTMLElement | null);
  let stageEl = $state(null as HTMLDivElement | null);
  let camEl = $state(null as HTMLDivElement | null);
  let barEl = $state(null as HTMLSpanElement | null);
  let camera = null as Camera | null;
  let snapNext = true;
  let lastScroll = 0;

  let vp = $state({ w: window.innerWidth, h: window.innerHeight });
  let active = $state(0);
  let tl = $state({ step: 0, frame: 0 });
  let near = $state(true);
  let idle = $state(false);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const weights = STEPS.map((s) => s.weight ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);
  const bounds = weights.reduce<number[]>((acc, w) => [...acc, acc[acc.length - 1] + w / total], [0]);

  const span = () => Math.max(1, (filmEl?.offsetHeight ?? 0) - window.innerHeight);
  const top = () => filmEl?.offsetTop ?? 0;

  $effect(() => {
    const el = stageEl;
    if (el === null) return;
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
      if (el === null) return;
      const p = Math.max(0, Math.min(0.99999, -el.getBoundingClientRect().top / span()));
      let i = 0;
      while (i < N - 1 && p >= bounds[i + 1]) i++;
      active = i;
      if (barEl !== null) barEl.style.transform = `scaleX(${Math.min(1, p * 1.002)})`;
    };
    const on = () => {
      lastScroll = performance.now();
      if (idle) idle = false;
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

  // a still reader gets told, once, that the page carries on
  $effect(() => {
    if (reduced) return;
    const t = window.setInterval(() => {
      if (!near || active === N - 1) {
        idle = false;
        return;
      }
      idle = performance.now() - lastScroll > IDLE;
    }, 500);
    return () => {
      window.clearInterval(t);
    };
  });

  $effect(() => {
    const el = filmEl;
    if (el === null) return;
    const io = new IntersectionObserver(
      (es) => {
        near = es[0].isIntersecting;
      },
      { rootMargin: "180px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
    };
  });

  $effect(() => {
    if (!near) return;
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
  const reach = $derived(needsOf(active));
  const st = $derived(stateOf(active, tl.step === active ? tl.frame : 0));
  const veil = $derived(veilFor(L.side, L, vp.w, vp.h));

  $effect(() => {
    const target = camOf(L);
    if (camera === null) {
      camera = new Camera(target, () => (camEl !== null ? [camEl] : []));
      camera.to(target, true);
      snapNext = false;
      return;
    }
    camera.to(target, snapNext || reduced);
    snapNext = false;
  });

  const jump = (i: number) => {
    const p = (bounds[i] + bounds[i + 1]) / 2;
    window.scrollTo({ top: top() + p * span(), behavior: reduced ? "auto" : "smooth" });
  };

  const next = $derived(active < N - 1 ? STEPS[active + 1] : null);
</script>

<section bind:this={filmEl} id="tour" class="film" data-film data-bounds={JSON.stringify(bounds)} style="height: {total * STEP_VH + 100}vh">
  <div bind:this={stageEl} class="stage">
    <div bind:this={camEl} class="cam" aria-hidden="true">
      <div class="win-frame">
        <Window {st} {site} active {reach} quick {lite} />
      </div>
    </div>

    <div class="veil" style:background={veil} aria-hidden="true"></div>
    <div class="aperture" aria-hidden="true"></div>

    {#each STEPS as s, i (s.id)}
      <Caption
        step={s}
        n={i}
        total={N}
        L={layouts[i]}
        on={i === active}
        cue={() => {
          jump(1);
        }}
      />
    {/each}

    <nav class="rail" aria-label="The reel">
      {#each STEPS as s, i (s.id)}
        <button
          class="rail-t"
          class:on={i === active}
          aria-current={i === active ? "step" : undefined}
          aria-label={s.kicker}
          onclick={() => {
            jump(i);
          }}
        >
          <span class="rail-l">{s.kicker}</span>
        </button>
      {/each}
    </nav>

    <div class="hud" class:show={idle}>
      <span class="hud-k">{active === 0 ? "Opening" : `${pad(active)} / ${pad(N - 1)}`}</span>
      <span class="hud-n">{next !== null ? `Next · ${next.kicker}` : "End of the reel"}</span>
      {#if next !== null}
        <svg class="hud-a" viewBox="0 0 10 16" width="9" height="14" aria-hidden="true"
          ><path
            d="M5 1v13M1 10l4 4 4-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
            stroke-linejoin="round"
          /></svg
        >
      {/if}
    </div>

    <div class="bar" aria-hidden="true"><span bind:this={barEl}></span></div>
  </div>
</section>
