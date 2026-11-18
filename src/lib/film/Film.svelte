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
  import {
    ARRIVE_BACK_MS,
    ARRIVE_SEEN_MS,
    ARRIVE_UNSEEN_MS,
    ARROW_REVEAL_MS,
    BACK_PULL_PX,
    NUDGE_MIN_PX,
    OVERRIDE_ARROW_PX,
    OVERRIDE_COMMIT_PX,
    PROGRESS_HOLD_MS,
    STREAM_QUIET_MS,
    clamp,
    evalReady,
    evalUnseen,
    frameDur,
    isArriveLocked,
    normalizeWheel,
    stepDemoMs,
  } from "./pace";
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
  let demoProgress = $state(1);
  let settling = $state(false);
  let settleProgress = $state(1);
  let overrideArrow = $state(false);
  let leaving = $state(false);
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

  // Phase arrival & gesture state (non-reactive hot-path fields).
  let syncUntil = 0;
  let syncTarget = -1;
  let leavingUntil = 0;
  let wasBelow = false;

  let arriveAt = -1e9;
  let arriveBaseMs = 0;
  let streamBroken = true;
  let lastInputAt = -1e9;
  let lastKeyAt = -1e9;
  let lastBobAt = -1e9;

  let inertiaUntil = 0;
  let inertiaTail = 0;
  let inertiaDir = 0;

  let readyEffort = 0;
  let backEffort = 0;
  let preEffort = 0;
  let postEffort = 0;
  let holdStartedAt = 0;
  let arrowShownAt = 0;
  let readyArrowAt = -1e9;
  let touchPostBank = 0;

  let relaxTimer = 0;
  let nudgeTimer = 0;
  let holdResetTimer = 0;
  let settleTimer = 0;

  const clearInputTimers = () => {
    window.clearTimeout(relaxTimer);
    window.clearTimeout(nudgeTimer);
    window.clearTimeout(holdResetTimer);
  };

  const clearAllTimers = () => {
    clearInputTimers();
    window.clearInterval(settleTimer);
  };

  const resetEffort = () => {
    clearInputTimers();
    readyEffort = 0;
    backEffort = 0;
    preEffort = 0;
    postEffort = 0;
    holdStartedAt = 0;
    arrowShownAt = 0;
    touchPostBank = 0;
    pull = 0;
    nudge = false;
    overrideArrow = false;
    speed = 1;
  };

  const pulseBob = (minGap = 310) => {
    const now = performance.now();
    if (now - lastBobAt < minGap) return;
    lastBobAt = now;
    nudgePulse++;
  };

  const armInertiaGuard = (dir: number, sampleAbs: number) => {
    inertiaDir = dir;
    inertiaTail = Math.max(14, sampleAbs);
    inertiaUntil = performance.now() + 1250;
  };

  // Starts the brief arrival-settle progress sweep so continuous scrolling stops at every phase.
  const beginArrival = (idx: number, dir: number, fromContinuous: boolean) => {
    window.clearInterval(settleTimer);
    const now = performance.now();
    const isSeen = seen.has(idx);
    arriveAt = now;
    streamBroken = !fromContinuous;
    arriveBaseMs = idx === 0 ? 480 : dir < 0 ? ARRIVE_BACK_MS : isSeen ? ARRIVE_SEEN_MS : ARRIVE_UNSEEN_MS;

    if (idx === 0 || !isSeen) {
      settling = false;
      settleProgress = 1;
      return;
    }

    settling = true;
    settleProgress = 0.08;
    settleTimer = window.setInterval(() => {
      const t = performance.now();
      const elapsed = t - arriveAt;
      if (t - lastInputAt >= STREAM_QUIET_MS) streamBroken = true;
      settleProgress = clamp(elapsed / Math.max(1, arriveBaseMs), 0.08, 1);
      if (!isArriveLocked(elapsed, arriveBaseMs, streamBroken)) {
        window.clearInterval(settleTimer);
        settling = false;
        settleProgress = 1;
        readyArrowAt = t;
      }
    }, 65);
  };

  const setStepScroll = (idx: number) => {
    const top = stepScrollY(idx);
    syncTarget = top;
    syncUntil = performance.now() + 200;
    window.scrollTo({ top, behavior: "auto" });
  };

  const enterPhase = (idx: number, dir: number, animateCue: boolean, fromContinuous: boolean) => {
    const next = clamp(idx, 0, STEPS.length - 1);
    leaving = false;
    resetEffort();
    if (animateCue) commitSeq++;
    if (next !== active) {
      active = next;
      setStepScroll(next);
    }
    beginArrival(next, dir, fromContinuous);
  };

  const jumpTo = (idx: number) => {
    const next = clamp(idx, 0, STEPS.length - 1);
    if (next === active) return;
    enterPhase(next, next > active ? 1 : -1, false, false);
  };

  const commitNext = (fromContinuous = true) => {
    seen.add(active);
    if (active < STEPS.length - 1) {
      enterPhase(active + 1, 1, true, fromContinuous);
      return;
    }
    const el = filmEl;
    if (!el) return;
    window.clearInterval(settleTimer);
    settling = false;
    leaving = true;
    commitSeq++;
    resetEffort();
    const now = performance.now();
    syncTarget = -1;
    syncUntil = now + 780;
    leavingUntil = now + 780;
    const target = Math.max(0, el.offsetTop + el.offsetHeight - Math.round(window.innerHeight * 0.14));
    window.scrollTo({ top: target, behavior: perf.reduced ? "auto" : "smooth" });
  };

  const commitPrev = (fromContinuous = true) => {
    if (active <= 0) return;
    enterPhase(active - 1, -1, false, fromContinuous);
  };

  const handleCueClick = () => {
    const now = performance.now();
    const elapsed = now - arriveAt;
    // Absorb accidental double-taps right as a new phase lands.
    if (settling || elapsed < Math.min(460, arriveBaseMs)) {
      pulseBob(220);
      return;
    }
    const readyNow = active === 0 || seen.has(active) || overrideArrow;
    if (readyNow) {
      commitNext(false);
      return;
    }
    // On an unseen phase, first click highlights progress; clicking again while trying reveals arrow & continues.
    if (holdStartedAt === 0) {
      preEffort = NUDGE_MIN_PX + 10;
      holdStartedAt = now;
      speed = 1.45;
      holdNudge(true, 1750);
      scheduleHoldReset(2800);
      return;
    }
    if (now - holdStartedAt < 360) {
      pulseBob(180);
      return;
    }
    overrideArrow = true;
    pull = 0.65;
    commitNext(false);
  };

  const scheduleReadyRelax = (ms = 320) => {
    window.clearTimeout(relaxTimer);
    relaxTimer = window.setTimeout(() => {
      readyEffort = 0;
      backEffort = 0;
      pull = 0;
    }, ms);
  };

  const scheduleOverrideRelax = (ms = 560) => {
    window.clearTimeout(relaxTimer);
    relaxTimer = window.setTimeout(() => {
      postEffort = 0;
      touchPostBank = 0;
      arrowShownAt = 0;
      overrideArrow = false;
      pull = 0;
      speed = 1;
    }, ms);
  };

  const scheduleHoldReset = (ms = 2200) => {
    window.clearTimeout(holdResetTimer);
    holdResetTimer = window.setTimeout(() => {
      preEffort = 0;
      postEffort = 0;
      touchPostBank = 0;
      holdStartedAt = 0;
      arrowShownAt = 0;
      overrideArrow = false;
      pull = 0;
      speed = 1;
    }, ms);
  };

  const holdNudge = (bob = false, ms = 1600) => {
    nudge = true;
    if (bob) pulseBob();
    window.clearTimeout(nudgeTimer);
    nudgeTimer = window.setTimeout(() => {
      if (!overrideArrow) nudge = false;
    }, ms);
  };

  // Scroll reader handles scrollbar drags, programmatic jumps, and re-entry from below-the-fold sections.
  $effect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = filmEl;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      inView = r.bottom > 0 && r.top < vh;
      const below = r.bottom < vh - 3;
      const reentered = wasBelow && !below && r.top <= 3;
      wasBelow = below;
      if (!below && leaving) leaving = false;
      const now = performance.now();
      if (now < leavingUntil) return;
      if (reentered) {
        lastInputAt = now;
        beginArrival(active, -1, true);
      }
      if (now < syncUntil && syncTarget >= 0 && Math.abs(window.scrollY - syncTarget) <= 6) return;
      const span = Math.max(1, el.offsetHeight - vh);
      const p = clamp(-r.top / span, 0, 0.99999);
      let i = 0;
      while (i < STEPS.length - 1 && p >= bounds[i + 1]) i++;
      if (i !== active) {
        resetEffort();
        const dir = i > active ? 1 : -1;
        active = i;
        beginArrival(i, dir, false);
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

  // Wheel, touch, and keyboard choreography with mandatory arrival pause and progress-first hold.
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
      const gap = now - lastInputAt;
      if (gap >= STREAM_QUIET_MS) streamBroken = true;
      lastInputAt = now;

      // Track and swallow decaying trackpad momentum carried over from the previous phase.
      const isInertiaTail = dir === inertiaDir && now < inertiaUntil && gap < 135 && abs <= inertiaTail * 1.28 + 6;
      if (isInertiaTail) inertiaTail = Math.min(inertiaTail * 0.97 + 1, abs);
      else if (gap >= STREAM_QUIET_MS || dir !== inertiaDir || abs > inertiaTail * 1.45 + 14) inertiaUntil = 0;

      // Mandatory phase-arrival pause: stop continuous scroll cleanly while showing the progress pill.
      const arriveElapsed = now - arriveAt;
      if (isArriveLocked(arriveElapsed, arriveBaseMs, streamBroken)) {
        if (!isInertiaTail && dir > 0 && active > 0 && arriveElapsed > 360) pulseBob(340);
        return;
      }
      if (settling) {
        window.clearInterval(settleTimer);
        settling = false;
        settleProgress = 1;
        readyArrowAt = now;
      }
      if (isInertiaTail) return;

      // Forward scrolling
      if (dy > 0) {
        backEffort = 0;
        const firstUnseen = active > 0 && !seen.has(active);

        if (!firstUnseen) {
          if (gap > 420) readyEffort = 0;
          readyEffort += dy;
          const ev = evalReady(readyEffort, active === 0, now - readyArrowAt);
          pull = ev.pull;
          if (ev.commit) {
            armInertiaGuard(1, abs);
            commitNext(true);
            return;
          }
          scheduleReadyRelax(320);
          return;
        }

        // Unseen demo: Stage 1 stops scrolling & shows progress for PROGRESS_HOLD_MS.
        if (holdStartedAt === 0) {
          preEffort += dy;
          if (preEffort < NUDGE_MIN_PX) {
            scheduleHoldReset(600);
            return;
          }
          holdStartedAt = now;
          const ev = evalUnseen(preEffort, 0, 0, 0);
          speed = ev.speed;
          holdNudge(true);
          scheduleHoldReset(2400);
          return;
        }

        const holdElapsed = now - holdStartedAt;
        if (holdElapsed < PROGRESS_HOLD_MS) {
          const ev = evalUnseen(preEffort, holdElapsed, 0, 0);
          overrideArrow = false;
          pull = 0;
          speed = ev.speed;
          holdNudge(true);
          scheduleHoldReset(2400);
          return;
        }

        // Stage 2: user is STILL scrolling after the progress hold — bring back arrow & stretch to top.
        if (gap > 560) postEffort *= 0.35;
        postEffort += dy;
        const willShow = postEffort >= OVERRIDE_ARROW_PX;
        if (willShow && arrowShownAt === 0) arrowShownAt = now;
        const shownMs = arrowShownAt > 0 ? now - arrowShownAt : 0;
        const ev = evalUnseen(preEffort, holdElapsed, postEffort, shownMs);
        overrideArrow = ev.showArrow;
        pull = ev.pull;
        speed = ev.speed;
        holdNudge(!ev.showArrow);
        if (ev.commit) {
          armInertiaGuard(1, abs);
          commitNext(true);
          return;
        }
        scheduleOverrideRelax(560);
        scheduleHoldReset(2500);
        return;
      }

      // Backward scrolling: first relax any active forward pull before stepping back a phase.
      if (readyEffort > 6) {
        readyEffort = Math.max(0, readyEffort + dy * 1.4);
        pull = evalReady(readyEffort, active === 0).pull;
        scheduleReadyRelax(260);
        return;
      }
      if (postEffort > 6 || overrideArrow) {
        postEffort = Math.max(0, postEffort + dy * 1.5);
        if (postEffort < OVERRIDE_ARROW_PX) {
          arrowShownAt = 0;
          overrideArrow = false;
          pull = 0;
          speed = 1;
        } else {
          const ev = evalUnseen(preEffort, PROGRESS_HOLD_MS + 1, postEffort, 0);
          pull = ev.pull;
          speed = ev.speed;
        }
        scheduleOverrideRelax(420);
        return;
      }

      if (gap > 380) backEffort = 0;
      backEffort += abs;
      if (backEffort >= BACK_PULL_PX) {
        armInertiaGuard(-1, abs);
        commitPrev(true);
        return;
      }
      scheduleReadyRelax(280);
    };

    let tId = -1;
    let sx = 0;
    let sy = 0;
    let ly = 0;
    let lt = 0;
    let vy = 0;
    let axis: "" | "x" | "y" = "";
    let touchBlocked = false;
    let touchHoldAnchorY: number | null = null;

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
      const now = performance.now();
      if (now - lastInputAt >= STREAM_QUIET_MS) streamBroken = true;
      lastInputAt = now;
      const t = e.touches[0];
      tId = t.identifier;
      sx = t.clientX;
      sy = t.clientY;
      ly = t.clientY;
      lt = now;
      vy = 0;
      axis = "";
      touchHoldAnchorY = null;
      touchBlocked = isArriveLocked(now - arriveAt, arriveBaseMs, streamBroken);
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
      vy = vy * 0.55 + ((ly - t.clientY) / dt) * 0.45;
      ly = t.clientY;
      lt = now;
      lastInputAt = now;

      // Absorb swipes begun during the mandatory phase-arrival pause.
      if (touchBlocked || isArriveLocked(now - arriveAt, arriveBaseMs, streamBroken)) {
        if (dy > 20 && active > 0 && now - arriveAt > 320) pulseBob(340);
        return;
      }
      if (settling) {
        window.clearInterval(settleTimer);
        settling = false;
        settleProgress = 1;
        readyArrowAt = now;
      }

      if (dy <= 0) {
        pull = 0;
        if (!overrideArrow) speed = 1;
        return;
      }
      if (active === 0) {
        pull = clamp(dy / 52, 0, 1);
        return;
      }
      if (seen.has(active)) {
        pull = clamp(dy / 96, 0, 1);
        if (dy >= 126) {
          tId = -1;
          commitNext(false);
        }
        return;
      }

      // First-play unseen touch: hold strictly on progress first; only bring back arrow after PROGRESS_HOLD_MS.
      if (holdStartedAt === 0) {
        if (dy < 16) return;
        preEffort = NUDGE_MIN_PX + dy;
        holdStartedAt = now;
        touchHoldAnchorY = t.clientY;
        speed = 1.22;
        holdNudge(true, 1750);
        scheduleHoldReset(3200);
        return;
      }

      const holdElapsed = now - holdStartedAt;
      if (holdElapsed < PROGRESS_HOLD_MS) {
        touchHoldAnchorY = t.clientY;
        overrideArrow = false;
        pull = 0;
        speed = evalUnseen(preEffort, holdElapsed, 0, 0).speed;
        holdNudge(true, 1750);
        scheduleHoldReset(3200);
        return;
      }

      const baseY = touchHoldAnchorY ?? sy;
      const postDy = Math.max(0, baseY - t.clientY);
      const eff = touchPostBank + postDy * 2.15;
      if (eff >= OVERRIDE_ARROW_PX && arrowShownAt === 0) arrowShownAt = now;
      const shownMs = arrowShownAt > 0 ? now - arrowShownAt : 0;
      const ev = evalUnseen(preEffort, holdElapsed, eff, shownMs);
      overrideArrow = ev.showArrow;
      pull = ev.pull;
      speed = ev.speed;
      holdNudge(!ev.showArrow, 1750);
      scheduleHoldReset(3200);
      if (ev.commit) {
        tId = -1;
        commitNext(false);
      }
    };

    const onTouchEnd = () => {
      if (tId < 0) return;
      const now = performance.now();
      const dy = sy - ly;
      const flick = vy;
      const wasY = axis === "y";
      const blocked = touchBlocked;
      const anchorY = touchHoldAnchorY;
      tId = -1;
      axis = "";
      touchBlocked = false;
      touchHoldAnchorY = null;
      streamBroken = true;
      if (!wasY || blocked) return;

      if (dy <= -56 || (dy <= -26 && flick <= -0.38)) {
        commitPrev(false);
        return;
      }
      if (dy <= 0) {
        scheduleReadyRelax(120);
        return;
      }
      if (active === 0) {
        if (dy >= 34 || (dy >= 16 && flick >= 0.28)) commitNext(false);
        else scheduleReadyRelax(120);
        return;
      }
      if (seen.has(active)) {
        if (dy >= 62 || (dy >= 26 && flick >= 0.38)) commitNext(false);
        else scheduleReadyRelax(120);
        return;
      }

      // First swipe on unseen phase ended during progress hold — stay stopped on progress pill.
      if (holdStartedAt === 0 || now - holdStartedAt < PROGRESS_HOLD_MS) {
        if (dy >= 18) {
          if (holdStartedAt === 0) {
            preEffort = NUDGE_MIN_PX + dy;
            holdStartedAt = now;
          }
          holdNudge(true, 1750);
          scheduleHoldReset(3200);
        }
        pull = 0;
        overrideArrow = false;
        speed = 1;
        return;
      }

      // Post-hold swipe: only commit once the arrow has actually returned and been pulled up.
      const postDy = Math.max(0, (anchorY ?? sy) - ly);
      const eff = touchPostBank + postDy * 2.15 + Math.max(0, flick) * 85;
      const shownMs = arrowShownAt > 0 ? now - arrowShownAt : 0;
      if (overrideArrow && eff >= OVERRIDE_COMMIT_PX && shownMs >= Math.min(180, ARROW_REVEAL_MS)) {
        commitNext(false);
        return;
      }
      if (postDy >= 18) {
        touchPostBank = Math.min(OVERRIDE_COMMIT_PX * 0.72, touchPostBank + postDy * 1.75);
        if (touchPostBank >= OVERRIDE_ARROW_PX) {
          overrideArrow = true;
          if (arrowShownAt === 0) arrowShownAt = now;
          pull = clamp(evalUnseen(preEffort, PROGRESS_HOLD_MS + 1, touchPostBank, 0).pull, 0.14, 0.65);
          scheduleOverrideRelax(950);
        } else {
          holdNudge(true, 1750);
        }
        scheduleHoldReset(3200);
        return;
      }
      scheduleOverrideRelax(480);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (!pinnedState().pinned) return;
      const now = performance.now();
      if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
        if (e.key === " " && (tag === "A" || tag === "BUTTON")) return;
        e.preventDefault();
        if (now - lastKeyAt < 420) return;
        lastKeyAt = now;
        commitNext(false);
      } else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
        if (active <= 0) return;
        e.preventDefault();
        if (now - lastKeyAt < 420) return;
        lastKeyAt = now;
        commitPrev(false);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      clearAllTimers();
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
    demoProgress = alreadySeen || totalMs <= 0 ? 1 : 0;
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
        demoProgress = k;
        if (k >= 1) {
          window.clearInterval(meterTimer);
          seen.add(idx);
          readyArrowAt = now;
          nudge = false;
          overrideArrow = false;
          speed = 1;
        }
      }, 120);
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
  const progress = $derived(settling ? settleProgress : demoProgress);

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
      {settling}
      {overrideArrow}
      {leaving}
      {progress}
      {pull}
      {nudge}
      {nudgePulse}
      {commitSeq}
      {ink}
      surface={cueSurface}
      dark={cueDark}
      {nextLabel}
      onAdvance={handleCueClick}
    />
  </div>
</section>
