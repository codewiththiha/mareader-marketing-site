<script lang="ts">
  import { untrack } from "svelte";
  import { perf } from "$lib/utils/perf.svelte";
  import { arrowGeometry, clamp } from "./pace";

  let {
    active,
    total,
    done,
    progress,
    pull,
    nudge,
    nudgePulse,
    speed,
    commitSeq,
    ink,
    surface,
    dark,
    nextLabel,
    onAdvance,
  }: {
    active: number;
    total: number;
    done: boolean;
    progress: number;
    pull: number;
    nudge: boolean;
    nudgePulse: number;
    speed: number;
    commitSeq: number;
    ink: { i: string; m: string };
    surface: string;
    dark: boolean;
    nextLabel: string;
    onAdvance: () => void;
  } = $props();

  let visPull = $state(0);
  let visVel = $state(0);
  let commitT = $state(0);
  let commitMode = $state(false);
  let apexAt = $state(0);
  let breathe = $state(0);
  let hover = $state(false);
  let mounted = $state(false);
  let taughtNext = $state(false);
  let bob = $state(false);

  $effect(() => {
    if (active >= 2 && !untrack(() => taughtNext)) taughtNext = true;
  });

  $effect(() => {
    const id = window.setTimeout(() => {
      mounted = true;
    }, 280);
    return () => {
      window.clearTimeout(id);
    };
  });

  // Gentle 3.5px cushion bob when a light early scroll meets a first-play demo.
  let lastPulse = 0;
  $effect(() => {
    const p = nudgePulse;
    if (p === 0 || p === lastPulse) return;
    lastPulse = p;
    untrack(() => {
      if (!done && pull <= 0.03) {
        commitMode = false;
        commitT = 0;
        apexAt = 0;
        visPull = 0;
        visVel = 0;
      }
      if (perf.reduced) return;
      bob = true;
    });
    const id = window.setTimeout(() => {
      bob = false;
    }, 320);
    return () => {
      window.clearTimeout(id);
    };
  });

  let lastSeq = 0;
  let settleUntil = 0;
  $effect(() => {
    const seq = commitSeq;
    if (seq === 0 || seq === lastSeq) return;
    lastSeq = seq;
    untrack(() => {
      const now = performance.now();
      if (perf.reduced) {
        visPull = 0;
        visVel = 0;
        commitT = 0;
        commitMode = false;
        apexAt = 0;
        return;
      }
      const start = Math.max(visPull, 0.16);
      visPull = start;
      commitMode = true;
      apexAt = start >= 0.985 ? now : 0;
      commitT = start >= 0.985 ? 0.002 : 0;
      settleUntil = now + 560;
    });
  });

  const targetPull = $derived(clamp(Math.max(pull, hover && done && !commitMode ? 0.28 : 0), 0, 1));
  const showRiser = $derived(done || pull > 0.03 || visPull > 0.02 || commitMode || commitT > 0);
  const fast = $derived(!done && (speed >= 1.42 || pull > 0.03));

  let liveTarget = 0;
  let liveDone = true;
  let liveHover = false;
  let liveCommit = false;
  let wakeLoop: (() => void) | null = null;

  $effect(() => {
    liveTarget = targetPull;
    liveDone = done;
    liveHover = hover;
    liveCommit = commitMode;
    wakeLoop?.();
  });

  $effect(() => {
    const activeLoop = showRiser && !perf.reduced && !perf.hidden;
    if (!activeLoop) {
      untrack(() => {
        visPull = perf.reduced ? liveTarget : 0;
        visVel = 0;
        breathe = 0;
        commitMode = false;
        commitT = 0;
        apexAt = 0;
      });
      return;
    }

    let raf = 0;
    let breathTimer = 0;
    let breathStart = 0;
    let last = performance.now();
    let p = untrack(() => visPull);
    let v = untrack(() => visVel);
    let b = 0;

    const scheduleBreath = (delayMs: number) => {
      if (breathTimer || perf.lite) return;
      breathTimer = window.setTimeout(() => {
        breathTimer = 0;
        if (!liveDone || liveHover || liveCommit || liveTarget > 0.02) return;
        breathStart = performance.now();
        start();
      }, delayMs);
    };

    const cancelBreath = () => {
      if (breathTimer) {
        window.clearTimeout(breathTimer);
        breathTimer = 0;
      }
      breathStart = 0;
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      if (liveCommit) {
        cancelBreath();
        const hit = untrack(() => apexAt);
        if (hit === 0) {
          const stepUp = Math.max(dt * 6.2, (1 - p) * (1 - Math.exp(-21 * dt)));
          v = Math.min(3.0, (stepUp / Math.max(dt, 0.008)) * 0.34);
          p = Math.min(1, p + stepUp);
          visPull = p;
          visVel = v;
          if (p >= 0.992) {
            p = 1;
            visPull = 1;
            apexAt = now;
            commitT = 0.002;
          }
        } else {
          p = 1;
          visPull = 1;
          const nextC = clamp((now - hit) / 360, 0.002, 1);
          commitT = nextC;
          if (nextC >= 1) {
            liveCommit = false;
            commitMode = false;
            apexAt = 0;
            commitT = 0;
            p = 0;
            v = 0;
            visPull = 0;
            visVel = 0;
          }
        }
        if (b !== 0) {
          b = 0;
          breathe = 0;
        }
        raf = requestAnimationFrame(tick);
        return;
      }

      const tgt = now < settleUntil ? 0 : liveTarget;
      const stiff = tgt > p ? 275 : 172;
      const damp = tgt > p ? 25.5 : 19.5;
      v += ((tgt - p) * stiff - v * damp) * dt;
      p = clamp(p + v * dt, 0, 1);
      if (Math.abs(tgt - p) < 0.0015 && Math.abs(v) < 0.008) {
        p = tgt;
        v = 0;
      }
      if (Math.abs(p - untrack(() => visPull)) > 0.0005) visPull = p;
      if (Math.abs(v - untrack(() => visVel)) > 0.004) visVel = v;

      let nextB = 0;
      const canBreathe = liveDone && tgt < 0.02 && !liveHover && now >= settleUntil && !perf.lite;
      if (canBreathe && breathStart > 0) {
        const u = (now - breathStart) / 1260;
        if (u < 1) nextB = Math.pow(Math.sin(u * Math.PI), 1.45);
        else breathStart = 0;
      } else {
        breathStart = 0;
        nextB = b * Math.exp(-10 * dt);
        if (nextB < 0.002) nextB = 0;
      }
      if (Math.abs(nextB - b) > 0.002 || (nextB === 0 && b !== 0)) {
        b = nextB;
        breathe = b;
      }

      const moving = p !== tgt || v !== 0 || breathStart > 0 || b > 0.002;
      if (moving) raf = requestAnimationFrame(tick);
      else if (canBreathe) scheduleBreath(2450);
    };

    const start = () => {
      if (liveTarget > 0.02 || liveHover || liveCommit) cancelBreath();
      if (!raf) {
        last = performance.now();
        p = untrack(() => visPull);
        v = untrack(() => visVel);
        raf = requestAnimationFrame(tick);
      }
    };

    wakeLoop = start;
    if (liveDone && liveTarget < 0.02 && !liveCommit) scheduleBreath(950);
    start();
    return () => {
      wakeLoop = null;
      cancelBreath();
      cancelAnimationFrame(raf);
    };
  });

  const g = $derived(arrowGeometry(visPull, visVel, commitT, breathe));
  const whisper = $derived.by(() => {
    if (commitMode || commitT > 0) return "";
    if (!done) return fast ? "Speeding up" : "";
    if (visPull > 0.34) return "";
    if (active === 0) return perf.coarse ? "Swipe up" : "Scroll to tour";
    if (active === 1 && !taughtNext) return perf.coarse ? "Swipe up" : "Scroll for next";
    if (active >= total - 1) return "More below";
    return "";
  });

  // Retain last non-empty whisper briefly so its fade-out stays smooth, then clear cleanly.
  let shownWhisper = $state("");
  $effect(() => {
    const w = whisper;
    if (w) {
      shownWhisper = w;
      return;
    }
    const id = window.setTimeout(() => {
      shownWhisper = "";
    }, 300);
    return () => {
      window.clearTimeout(id);
    };
  });

  const stretchActive = $derived((visPull > 0.06 && commitT === 0) || (commitMode && apexAt === 0));
  const exiting = $derived(commitT > 0.48);
  const showStill = $derived(!showRiser && !done && nudge);
</script>

<div
  class="cue-slot"
  class:in={mounted}
  class:pulling={stretchActive}
  class:fast={fast && !commitMode}
  class:out={exiting}
  data-cue-dark={dark}
  style:--cue-ink={ink.i}
  style:--cue-muted={ink.m}
  style:--cue-bg={surface}
  style:--cue-pull={visPull.toFixed(3)}
>
  {#if showRiser}
    <button
      type="button"
      class="cue-riser-wrap"
      aria-label={nextLabel}
      onmouseenter={() => {
        hover = true;
      }}
      onmouseleave={() => {
        hover = false;
      }}
      onfocus={() => {
        hover = true;
      }}
      onblur={() => {
        hover = false;
      }}
      onclick={onAdvance}
    >
      <span class="cue-riser" aria-hidden="true">
        <svg viewBox="0 0 34 54" width="34" height="54" fill="none">
          <path
            d="M 11.4 {g.yTop.toFixed(2)} Q 17 {(g.yTop - g.topBow).toFixed(2)} 22.6 {g.yTop.toFixed(2)}"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
            opacity={g.topAlpha.toFixed(3)}
          />
          {#if g.guideAlpha > 0.008}
            <line
              x1="17"
              y1={(g.yTop + 3.2).toFixed(2)}
              x2="17"
              y2={g.guideY2.toFixed(2)}
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-dasharray="1.3 2.9"
              opacity={g.guideAlpha.toFixed(3)}
            />
          {/if}
          {#if g.haloAlpha > 0.01}
            <circle cx="17" cy="8.2" r={g.haloR.toFixed(2)} stroke="currentColor" stroke-width="1.15" opacity={g.haloAlpha.toFixed(3)} />
          {/if}
          {#if g.rootAlpha > 0.01}
            <circle cx="17" cy="46.8" r="1.2" fill="currentColor" opacity={g.rootAlpha.toFixed(3)} />
          {/if}
          <g opacity={g.arrowAlpha.toFixed(3)}>
            <line
              x1="17"
              y1={g.yTail.toFixed(2)}
              x2="17"
              y2={(g.yTip + 0.35).toFixed(2)}
              stroke="currentColor"
              stroke-width={g.stroke.toFixed(2)}
              stroke-linecap="round"
            />
            <path
              d="M {(17 - g.wx).toFixed(2)} {(g.yTip + g.wy).toFixed(2)} Q {(17 - g.wx * 0.44).toFixed(2)} {(g.yTip + g.wy * 0.4).toFixed(
                2,
              )} 17 {g.yTip.toFixed(2)} Q {(17 + g.wx * 0.44).toFixed(2)} {(g.yTip + g.wy * 0.4).toFixed(2)} {(17 + g.wx).toFixed(2)} {(
                g.yTip + g.wy
              ).toFixed(2)}"
              stroke="currentColor"
              stroke-width={g.stroke.toFixed(2)}
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
        </svg>
      </span>
      <span class="cue-whisper" class:on={!!whisper} aria-hidden={!whisper} aria-live="polite">{shownWhisper}</span>
    </button>
  {:else}
    <button type="button" class="cue-watch" class:nudge={showStill} class:bob aria-label={nextLabel} onclick={onAdvance}>
      <span class="cue-dot" aria-hidden="true"></span>
      <span class="cue-bar" aria-hidden="true">
        <i style:transform="scaleX({clamp(progress, 0.05, 1).toFixed(3)})"></i>
      </span>
      <span class="cue-note-clip" class:on={showStill} aria-live="polite">
        <span class="cue-note">{showStill ? "Still playing" : ""}</span>
      </span>
    </button>
  {/if}
</div>
