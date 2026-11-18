<script lang="ts">
  import Window from "$lib/window/Window.svelte";
  import Caption from "./Caption.svelte";
  import { Camera } from "./camera";
  import { camOf, layoutOf, veilFor } from "./layout";
  import { STEPS, needsOf, stateOf } from "./steps";
  import { lite } from "$lib/utils/power";
  import type { Site } from "$lib/looks";

  let { site }: { site: Site } = $props();

  const STEP_VH = 60;
  const N = STEPS.length;
  const TICK = 100;

  let filmEl = $state(null as HTMLElement | null);
  let stageEl = $state(null as HTMLDivElement | null);
  let camEl = $state(null as HTMLDivElement | null);
  let barEl = $state(null as HTMLSpanElement | null);
  let camera = null as Camera | null;
  let snapNext = true;
  let lastY = 0;
  let lastT = 0;
  let vel = 0;

  let vp = $state({ w: window.innerWidth, h: window.innerHeight });
  let active = $state(0);
  let tl = $state({ step: 0, frame: 0 });
  let near = $state(true);
  let playFill = 0;
  let scrollFill = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const weights = STEPS.map((s) => s.weight ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);
  const bounds = weights.reduce<number[]>((acc, w) => [...acc, acc[acc.length - 1] + w / total], [0]);

  const span = () => Math.max(1, (filmEl?.offsetHeight ?? 0) - window.innerHeight);
  const draw = () => {
    if (barEl !== null) barEl.style.transform = `scaleX(${Math.max(scrollFill, playFill).toFixed(4)})`;
  };
  const top = () => filmEl?.offsetTop ?? 0;

  // A hard scroll carries the clip with it; a slow one lets it play out.
  const pace = () => (reduced ? 0.7 : Math.min(3.2, 1 + vel * 2.6));

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
    lastY = window.scrollY;
    lastT = performance.now();
    const read = () => {
      raf = 0;
      const el = filmEl;
      if (el === null) return;
      const p = Math.max(0, Math.min(0.99999, -el.getBoundingClientRect().top / span()));
      let i = 0;
      while (i < N - 1 && p >= bounds[i + 1]) i++;
      active = i;
      scrollFill = Math.min(1, p * 1.002);
      draw();
    };
    const on = () => {
      const y = window.scrollY;
      const t = performance.now();
      const dt = Math.max(8, t - lastT);
      vel = vel * 0.55 + (Math.abs(y - lastY) / dt) * 0.45;
      lastY = y;
      lastT = t;
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
    const last = s.frames.length - 1;
    tl = { step: active, frame: 0 };
    let f = 0;
    let held = 0;
    const tick = window.setInterval(() => {
      vel *= 0.86;
      const dur = Array.isArray(s.ms) ? (s.ms[f] ?? 1700) : (s.ms ?? 1700);
      held += TICK * pace();
      if (held >= dur) {
        held = 0;
        if (f >= last && !s.loop) {
          window.clearInterval(tick);
        } else {
          f = f >= last ? (s.loopFrom ?? 0) : f + 1;
          tl = { step: active, frame: f };
        }
      }
      const frac = (f + Math.min(1, held / dur)) / (last + 1);
      playFill = Math.min(1, (active + frac) / N);
      draw();
    }, TICK);
    return () => {
      window.clearInterval(tick);
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

    <div class="bar" aria-hidden="true"><span bind:this={barEl}></span></div>
  </div>
</section>
