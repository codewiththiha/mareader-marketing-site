<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import type { Progress } from "./playback";

  let {
    index,
    total,
    touch,
    motion,
    reduced,
    nextLabel,
    onnext,
    onskip,
  }: {
    index: number;
    total: number;
    touch: boolean;
    motion: Progress | null;
    reduced: boolean;
    nextLabel: string;
    onnext: () => void;
    onskip: (event: MouseEvent) => void;
  } = $props();

  let head = $state<SVGPathElement>();
  let stem = $state<SVGPathElement>();
  const lift = 10;
  const label = $derived(
    motion
      ? "Demo playing"
      : index === 0
        ? touch
          ? "Swipe up to explore"
          : "Scroll to explore"
        : index === total - 1
          ? "Explore more"
          : "Next scene",
  );
  const number = (n: number) => String(n).padStart(2, "0");

  $effect(() => {
    if (!head || !stem || !motion) return;
    const options: KeyframeAnimationOptions = { duration: motion.remaining, fill: "both", easing: "linear" };
    const rise = head.animate([{ transform: `translateY(${lift * (1 - motion.ratio)}px)` }, { transform: "translateY(0px)" }], options);
    const draw = stem.animate([{ transform: `scaleY(${0.44 + 0.56 * motion.ratio})` }, { transform: "scaleY(1)" }], options);
    return () => {
      rise.cancel();
      draw.cancel();
    };
  });
</script>

<div class="tour-guide" class:first={index === 0}>
  <button
    type="button"
    class="tour-next"
    class:playing={motion !== null}
    onclick={onnext}
    aria-label={`${label}. ${nextLabel}`}
    aria-controls="tour-scene"
  >
    <svg class="tour-arrow" width="22" height="27" viewBox="0 0 22 27" fill="none" aria-hidden="true">
      <path class="tour-arrow-track" d="M11 23V4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
      <path class="tour-arrow-stem" bind:this={stem} d="M11 23V5" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" />
      <path
        class="tour-arrow-head"
        bind:this={head}
        d="m7.1 9 3.9-4 3.9 4"
        stroke="currentColor"
        stroke-width="1.45"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span class="tour-labels" aria-hidden="true">
      {#key label}
        <span in:fly={{ y: 3, duration: reduced ? 0 : 230 }} out:fade={{ duration: reduced ? 0 : 100 }}>{label}</span>
      {/key}
    </span>
    <span class="tour-index" aria-hidden="true">{number(index + 1)}<span> / {number(total)}</span></span>
  </button>
  <a class="tour-skip" href="#tour-end" onclick={onskip}>Skip tour</a>
  <span class="sr-only" role="status">{motion ? "Demo playing. Keep scrolling or use the next scene button to continue." : ""}</span>
</div>
