<script lang="ts">
  import { untrack } from "svelte";
  import { SvelteSet } from "svelte/reactivity";
  import { blendOver, look as lookOf, rgba, type Site } from "$lib/looks";
  import { perf } from "$lib/utils/perf.svelte";
  import Window from "$lib/window/Window.svelte";
  import Caption from "./Caption.svelte";
  import ScrollCue from "./ScrollCue.svelte";
  import { Camera } from "./camera";
  import { camOf, layoutOf, maskFor, type Layout, type Side } from "./layout";
  import { BACK_PULL_PX, HEAVY_COMMIT_PX, clamp, evalForward, frameDur, normalizeWheel, stepDemoMs } from "./pace";
  import { STEPS, bakeKey, stateOf } from "./steps";

  let { site }: { site: Site } = $props();

  const BLURS = import.meta.glob<string>("../../blur/*.webp", { eager: true, query: "?url", import: "default" });
  const HAS_BLURS = Object.keys(BLURS).length > 0;
  const blurUrl = (key: string): string | undefined => BLURS[`../../blur/${key}.webp`];

  const STEP_VH = 68;
  const SIDES: Side[] = ["left", "right", "top", "bottom"];

  let filmEl = $state(null as HTMLElement | null);
  let stageEl = $state(null as HTMLDivElement | null);
  let camEl = $state(null as HTMLDivElement | null);
  let lensEls = $state([] as (HTMLDivElement | null)[]);
  let camera = null as Camera | null;
  let snapNext = true;

  let vp = $state({ w: window.innerWidth, h: window.innerHeight });
  let active = $state(0);
  let exiting = $state(-1);
  let inView = $state(true);
  let lensAlive = $state(false);
  let tl = $state({ step: 0, frame: 0 });

  const seen = new SvelteSet<number>([0]);
  let progress = $state(1);
  let pull = $state(0);
  let nudge = $state(false);
  let nudgePulse = $state(0);
  let speed = $state(1);
  let commitSeq = $state(0);

  const weights = STEPS.map((s) => s.weight ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);
  const bounds = weights.reduce<number[]>((acc, w) => [...acc, acc[acc.length - 1] + w / total], [0]);

  let prevActive = 0;
  $effect(() => {
    const cur = active;
    if (cur === prevActive) return;
    const old = prevActive;
    prevActive = cur;
    exiting = old;
    const id = window.setTimeout(() => {
      if (exiting === old) exiting = -1;
    }, 360);
    return () => {
      window.clearTimeout(id);
    };
  });

  $effect(() => {
    const on = !!STEPS[active].zoom;
    if (on) {
      if (!untrack(() => lensAlive)) lensAlive = true;
      return;
    }
    if (!untrack(() => lensAlive)) return;
    const id = window.setTimeout(() => {
      lensAlive = false;
    }, 680);
    return () => {
      window.clearTimeout(id);
    };
  });

  $effect(() => {
    const el = stageEl;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      if (nw === vp.w && nh === vp.h) return;
      snapNext = true;
      vp = { w: nw, h: nh };
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  });

  const stepScrollY = (idx: number): number => {
    const el = filmEl;
    if (!el || idx <= 0) return 0;
    const i = clamp(idx, 0, STEPS.length - 1);
    const span = Math.max(1, el.offsetHeight - window.innerHeight);
    return Math.round(el.offsetTop + (bounds[i] + (bounds[i + 1] - bounds[i]) * 0.45) * span);
  };

  let syncUntil = 0;
  let syncTarget = -1;
  let leavingUntil = 0;
  let lastBobAt = 0;
  let effort = 0;
  let backEffort = 0;
  let touchBank = 0;
  let relaxTimer = 0;
  let nudgeTimer = 0;
  let bankTimer = 0;
  let shieldHard = 0;
  let shieldSoft = 0;
  let shieldTail = 0;
  let shieldDir = 0;
  let lastWheelAt = 0;

  const clearTimers = () => {
    window.clearTimeout(relaxTimer);
    window.clearTimeout(nudgeTimer);
    window.clearTimeout(bankTimer);
  };

  const resetPull = () => {
    clearTimers();
    effort = 0;
    backEffort = 0;
    touchBank = 0;
    pull = 0;
    nudge = false;
    speed = 1;
  };

  const armShield = (dir: number, sampleAbs: number) => {
    const now = performance.now();
    shieldDir = dir;
    shieldTail = Math.max(12, sampleAbs);
    shieldHard = now + 330;
    shieldSoft = now + 980;
  };

  const setStepScroll = (idx: number) => {
    const top = stepScrollY(idx);
    syncTarget = top;
    syncUntil = performance.now() + 180;
    window.scrollTo({ top, behavior: "auto" });
  };

  const jumpTo = (idx: number, animateCue = false) => {
    const next = clamp(idx, 0, STEPS.length - 1);
    resetPull();
    if (animateCue) commitSeq++;
    if (next === active) return;
    active = next;
    setStepScroll(next);
  };

  const commitNext = () => {
    seen.add(active);
    commitSeq++;
    resetPull();
    if (active < STEPS.length - 1) {
      const next = active + 1;
      active = next;
      setStepScroll(next);
      return;
    }
    const el = filmEl;
    if (!el) return;
    const now = performance.now();
    syncTarget = -1;
    syncUntil = now + 720;
    leavingUntil = now + 720;
    const target = Math.max(0, el.offsetTop + el.offsetHeight - Math.round(window.innerHeight * 0.14));
    window.scrollTo({ top: target, behavior: perf.reduced ? "auto" : "smooth" });
  };

  const commitPrev = () => {
    resetPull();
    if (active <= 0) return;
    const prev = active - 1;
    active = prev;
    setStepScroll(prev);
  };

  const scheduleRelax = (ms = 270) => {
    window.clearTimeout(relaxTimer);
    relaxTimer = window.setTimeout(() => {
      effort = 0;
      backEffort = 0;
      pull = 0;
      speed = 1;
    }, ms);
  };

  const holdNudge = (softBob = false, ms = 1450) => {
    nudge = true;
    if (softBob) {
      const now = performance.now();
      if (now - lastBobAt > 280) {
        lastBobAt = now;
        nudgePulse++;
      }
    }
    window.clearTimeout(nudgeTimer);
    nudgeTimer = window.setTimeout(() => {
      nudge = false;
    }, ms);
  };

  $effect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = filmEl;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      inView = r.bottom > 0 && r.top < vh;
      const now = performance.now();
      if (now < leavingUntil) return;
      if (now < syncUntil && syncTarget >= 0 && Math.abs(window.scrollY - syncTarget) <= 6) return;
      const span = Math.max(1, el.offsetHeight - vh);
      const p = clamp(-r.top / span, 0, 0.99999);
      let i = 0;
      while (i < STEPS.length - 1 && p >= bounds[i + 1]) i++;
      if (i !== active) {
        resetPull();
        active = i;
      }
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  });

  $effect(() => {
    const el = filmEl;
    if (!el) return;

    const pinnedState = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      return { pinned: r.top <= 3 && r.bottom >= vh - 3, below: r.bottom < vh - 3, vh };
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.35) return;
      const now = performance.now();
      if (now < leavingUntil) {
        if (e.deltaY > 0) e.preventDefault();
        return;
      }
      const { pinned, below, vh } = pinnedState();
      if (below || !pinned) return;
      const dy = normalizeWheel(e.deltaY, e.deltaMode, vh);
      if (Math.abs(dy) < 0.4) return;
      if (active === 0 && dy < 0 && window.scrollY <= 2) return;

      e.preventDefault();
      const abs = Math.abs(dy);
      const dir = dy > 0 ? 1 : -1;
      const gap = now - lastWheelAt;
      lastWheelAt = now;

      if (dir === shieldDir && now < shieldSoft) {
        if (now < shieldHard || (gap < 115 && abs <= shieldTail * 1.34 + 8)) {
          shieldTail = Math.min(shieldTail * 0.97 + 1, abs);
          return;
        }
        shieldSoft = 0;
      }

      if (dy > 0) {
        backEffort = 0;
        if (gap > 420) effort *= 0.25;
        const firstUnseen = active > 0 && !seen.has(active);
        const boost = firstUnseen && abs > 68 ? 1.24 : 1;
        effort += dy * boost;
        const ev = evalForward(effort, active === 0, firstUnseen);
        pull = ev.pull;
        speed = ev.speed;
        if (ev.nudge) holdNudge(ev.pull <= 0.03);
        if (ev.commit) {
          armShield(1, abs);
          commitNext();
          return;
        }
        scheduleRelax(280);
        return;
      }

      if (effort > 6) {
        effort = Math.max(0, effort + dy * 1.4);
        const ev = evalForward(effort, active === 0, active > 0 && !seen.has(active));
        pull = ev.pull;
        speed = ev.speed;
        scheduleRelax(240);
        return;
      }

      if (gap > 360) backEffort = 0;
      backEffort += abs;
      if (backEffort >= BACK_PULL_PX) {
        armShield(-1, abs);
        commitPrev();
        return;
      }
      scheduleRelax(250);
    };

    let tId = -1;
    let sx = 0;
    let sy = 0;
    let ly = 0;
    let lt = 0;
    let vy = 0;
    let axis: "" | "x" | "y" = "";

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || performance.now() < leavingUntil) {
        tId = -1;
        return;
      }
      const target = e.target as Element | null;
      if (target?.closest("a, button")) {
        tId = -1;
        return;
      }
      if (!pinnedState().pinned) {
        tId = -1;
        return;
      }
      const t = e.touches[0];
      tId = t.identifier;
      sx = t.clientX;
      sy = t.clientY;
      ly = t.clientY;
      lt = performance.now();
      vy = 0;
      axis = "";
      window.clearTimeout(relaxTimer);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (tId < 0 || e.touches.length !== 1) return;
      const t = e.touches[0];
      if (t.identifier !== tId) return;
      const dx = t.clientX - sx;
      const dy = sy - t.clientY;
      if (!axis) {
        if (Math.abs(dx) < 7 && Math.abs(dy) < 7) return;
        axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? "x" : "y";
      }
      if (axis !== "y") return;
      if (active === 0 && dy < 0 && window.scrollY <= 2) return;
      if (!pinnedState().pinned) return;

      e.preventDefault();
      const now = performance.now();
      const dt = Math.max(4, now - lt);
      const instV = (ly - t.clientY) / dt;
      vy = vy * 0.55 + instV * 0.45;
      ly = t.clientY;
      lt = now;

      if (dy <= 0) {
        pull = 0;
        speed = 1;
        return;
      }
      if (active === 0) {
        pull = clamp(dy / 54, 0, 1);
        return;
      }
      if (seen.has(active)) {
        pull = clamp(dy / 94, 0, 1);
        if (dy >= 122) {
          tId = -1;
          commitNext();
        }
        return;
      }
      const ev = evalForward(touchBank + dy * 1.45, false, true);
      pull = ev.pull;
      speed = ev.speed;
      if (ev.nudge) holdNudge(ev.pull <= 0.03, 1550);
      if (ev.commit) {
        tId = -1;
        commitNext();
      }
    };

    const onTouchEnd = () => {
      if (tId < 0) return;
      const dy = sy - ly;
      const flick = vy;
      const wasY = axis === "y";
      tId = -1;
      axis = "";
      if (!wasY) return;

      if (dy <= -50 || (dy <= -22 && flick <= -0.36)) {
        commitPrev();
        return;
      }
      if (dy <= 0) {
        scheduleRelax(80);
        return;
      }
      if (active === 0) {
        if (dy >= 32 || (dy >= 14 && flick >= 0.26)) commitNext();
        else scheduleRelax(90);
        return;
      }
      if (seen.has(active)) {
        if (dy >= 56 || (dy >= 22 && flick >= 0.36)) commitNext();
        else scheduleRelax(90);
        return;
      }
      const energy = touchBank + dy * 1.5 + Math.max(0, flick) * 105;
      if (energy >= HEAVY_COMMIT_PX * 0.8) {
        commitNext();
        return;
      }
      if (dy >= 20) {
        touchBank = Math.min(220, touchBank + dy * 1.45 + Math.max(0, flick) * 65);
        holdNudge(true, 1550);
        window.clearTimeout(bankTimer);
        bankTimer = window.setTimeout(() => {
          touchBank = 0;
        }, 1900);
      }
      pull = 0;
      speed = 1;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (!pinnedState().pinned) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
        if (e.key === " " && (tag === "A" || tag === "BUTTON")) return;
        e.preventDefault();
        commitNext();
      } else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
        if (active <= 0) return;
        e.preventDefault();
        commitPrev();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimers();
      window.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  });

  let playRate = 1;
  let rescheduleFrame: (() => void) | null = null;
  $effect(() => {
    const next = speed * (perf.reduced ? 0.65 : 1);
    if (Math.abs(next - playRate) < 0.05) return;
    playRate = next;
    rescheduleFrame?.();
  });

  $effect(() => {
    const idx = active;
    const s = STEPS[idx];
    tl = { step: idx, frame: 0 };
    if (perf.hidden || !inView) return;

    const totalMs = stepDemoMs(s);
    const alreadySeen = untrack(() => seen.has(idx));
    progress = alreadySeen || totalMs <= 0 ? 1 : 0;
    if (totalMs <= 0 && !alreadySeen) untrack(() => seen.add(idx));

    let f = 0;
    let frameNeed = frameDur(s, 0);
    let frameSpent = 0;
    let frameStamp = performance.now();
    let frameTimer = 0;

    const armFrame = () => {
      window.clearTimeout(frameTimer);
      const last = f >= s.frames.length - 1;
      if (s.frames.length <= 1 || (last && !s.loop)) return;
      const now = performance.now();
      frameSpent += (now - frameStamp) * playRate;
      frameStamp = now;
      const rem = Math.max(70, (frameNeed - frameSpent) / Math.max(0.4, playRate));
      frameTimer = window.setTimeout(() => {
        f = last ? (s.loopFrom ?? 0) : f + 1;
        tl = { step: idx, frame: f };
        frameNeed = frameDur(s, f);
        frameSpent = 0;
        frameStamp = performance.now();
        armFrame();
      }, rem);
    };

    rescheduleFrame = armFrame;
    armFrame();

    let meterTimer = 0;
    if (!alreadySeen && totalMs > 0) {
      let demoSpent = 0;
      let meterStamp = performance.now();
      meterTimer = window.setInterval(() => {
        const now = performance.now();
        demoSpent += (now - meterStamp) * Math.max(0.5, playRate);
        meterStamp = now;
        const k = clamp(demoSpent / totalMs, 0, 1);
        progress = k;
        if (k >= 1) {
          window.clearInterval(meterTimer);
          seen.add(idx);
          nudge = false;
          speed = 1;
        }
      }, 140);
    }

    return () => {
      rescheduleFrame = null;
      window.clearTimeout(frameTimer);
      window.clearInterval(meterTimer);
    };
  });

  const layouts = $derived(STEPS.map((s) => layoutOf(s, vp.w, vp.h)));
  const L = $derived(layouts[active]);
  const step = $derived(STEPS[active]);
  const frame = $derived(tl.step === active ? tl.frame : 0);
  const st = $derived(stateOf(active, frame));
  const done = $derived(seen.has(active));

  $effect(() => {
    const target = camOf(L);
    if (!camera) {
      camera = new Camera(target, () => [camEl, ...lensEls].filter(Boolean) as HTMLElement[]);
      camera.to(target, true);
      snapNext = false;
      return;
    }
    camera.to(target, snapNext || perf.reduced);
    snapNext = false;
  });

  $effect(() => {
    return () => {
      camera?.stop();
    };
  });

  const siteBg = $derived(site === "dark" ? "#12100e" : "#f6f1e8");
  const lensLook = $derived(step.lens === "chrome" ? lookOf(st.chrome, site) : lookOf(st.looks[0], site));
  const url = $derived(HAS_BLURS && step.zoom ? blurUrl(bakeKey(active, frame, site)) : undefined);
  let bag: string[] = [];
  const recent = $derived.by(() => {
    if (url && bag[bag.length - 1] !== url) bag = [...bag.filter((u) => u !== url), url].slice(-3);
    return bag;
  });
  const tone = $derived(rgba(lensLook.p, url ? (lensLook.dark ? 0.34 : 0.26) : 0.9));
  const washBg = $derived(blendOver(lensLook.p, siteBg, 0.9));
  const cueDark = $derived(step.zoom ? lensLook.dark : site === "dark");
  const cueSurface = $derived(step.zoom ? washBg : siteBg);
  const ink = $derived(
    step.zoom
      ? lensLook.dark
        ? { i: "#f6efe4", m: "rgba(246,239,228,.80)" }
        : { i: "#1c1610", m: "rgba(28,22,16,.74)" }
      : { i: "var(--ink)", m: "var(--muted)" },
  );

  const nextLabel = $derived(
    active === 0
      ? "Start feature tour"
      : active < STEPS.length - 1
        ? `Next scene: ${STEPS[active + 1].title}`
        : "Continue to details and downloads",
  );

  let bagL: Partial<Record<Side, Layout>> = {};
  const lastLayout = $derived.by(() => {
    bagL[L.side] = L;
    return bagL;
  });

  const washStyle = (side: Side, LL: Layout, w: number, h: number): string => {
    const mask = maskFor(side, LL, w, h);
    const base = `-webkit-mask-image:${mask};mask-image:${mask};background-color:${washBg}`;
    if (side === "left") return `${base};left:0;top:0;bottom:0;width:${Math.min(w, Math.ceil(LL.fa.x + 22))}px`;
    if (side === "right") {
      const rw = Math.min(w, Math.ceil(w - (LL.fa.x + LL.fa.w) + 22));
      return `${base};right:0;top:0;bottom:0;width:${rw}px`;
    }
    if (side === "bottom") {
      const bh = Math.min(h, Math.ceil(h - LL.text.y + 38));
      return `${base};left:0;right:0;bottom:0;height:${bh}px`;
    }
    const th = Math.min(h, Math.ceil(LL.text.y + LL.text.h + 50));
    return `${base};left:0;right:0;top:0;height:${th}px`;
  };
</script>

<section
  bind:this={filmEl}
  id="tour"
  class="film"
  data-film
  data-step={active}
  data-bounds={JSON.stringify(bounds)}
  style="height: {total * STEP_VH + 100}vh"
>
  <div bind:this={stageEl} class="stage">
    <div bind:this={camEl} class="cam" aria-hidden="true">
      <div class="win-frame">
        <Window {st} {site} active={inView} {speed} />
      </div>
    </div>

    {#if lensAlive}
      {#each SIDES as side, i (side)}
        {@const fit = (side === "left" || side === "right") === L.landscape}
        {#if fit}
          {@const show = !!step.zoom && L.side === side}
          {@const LL = show ? L : (lastLayout[side] ?? L)}
          {#if HAS_BLURS}
            {@const mask = maskFor(side, LL, vp.w, vp.h)}
            <div class="lens" style:opacity={show ? 1 : 0} style:-webkit-mask-image={mask} style:mask-image={mask} aria-hidden="true">
              <div class="lens-base"></div>
              <div bind:this={lensEls[i]} class="lens-cam">
                {#each recent as u (u)}
                  <img src={u} alt="" decoding="async" class="lens-img" style:opacity={u === url ? 1 : 0} />
                {/each}
              </div>
              <div class="lens-tone" style:background={tone}></div>
            </div>
          {:else if show || lastLayout[side]}
            <div class="lens-wash" style="{washStyle(side, LL, vp.w, vp.h)};opacity:{show ? 1 : 0}" aria-hidden="true"></div>
          {/if}
        {/if}
      {/each}
    {/if}

    {#each STEPS as s, i (s.id)}
      {#if i === active || i === exiting}
        <Caption step={s} L={layouts[i]} on={i === active} ink={i === active ? ink : { i: "var(--ink)", m: "var(--muted)" }} />
      {/if}
    {/each}

    <nav class="film-rail" class:on={active > 0} style:--rail-ink={ink.i} aria-label="Tour scenes">
      {#each STEPS.slice(1) as s, idx (s.id)}
        {@const stepIdx = idx + 1}
        <button
          type="button"
          class="rail-tick"
          class:active={active === stepIdx}
          class:playing={active === stepIdx && !done}
          class:seen={seen.has(stepIdx)}
          title={s.title}
          aria-label="Scene {stepIdx} of {STEPS.length - 1}: {s.title}"
          aria-current={active === stepIdx ? "step" : undefined}
          onclick={() => {
            jumpTo(stepIdx);
          }}
        >
          <i></i>
        </button>
      {/each}
    </nav>

    <ScrollCue
      {active}
      total={STEPS.length}
      {done}
      {progress}
      {pull}
      {nudge}
      {nudgePulse}
      {speed}
      {commitSeq}
      {ink}
      surface={cueSurface}
      dark={cueDark}
      {nextLabel}
      onAdvance={commitNext}
    />
  </div>
</section>
