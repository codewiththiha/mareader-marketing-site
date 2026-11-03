<script lang="ts">
  // SelectionBar — bar over selected word
  import {
    Copy,
    Sparkles,
    BookOpenText,
    StickyNote,
    Volume2,
    Highlighter,
    Underline
  } from "@lucide/svelte";

  let { open }: { open: boolean } = $props();
  let mounted = $state(false);
  let show = $state(false);
  let ref: HTMLDivElement | undefined = $state();
  let shift = $state(0);
  let timer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    if (open) {
      mounted = true;
      requestAnimationFrame(() => requestAnimationFrame(() => (show = true)));
    } else {
      show = false;
      timer = setTimeout(() => (mounted = false), 360);
    }
    return () => clearTimeout(timer);
  });

  $effect(() => {
    if (!mounted) return;
    const measure = () => {
      const card = ref;
      const word = card?.parentElement;
      const pane = word?.closest(".mk-pane") as HTMLElement | null;
      if (!card || !word || !pane) return;
      let x = 0;
      let cur: HTMLElement | null = word;
      while (cur && cur !== pane) {
        x += cur.offsetLeft;
        cur = cur.offsetParent as HTMLElement | null;
      }
      const centre = x + word.offsetWidth / 2;
      const half = card.offsetWidth / 2;
      const clamped = Math.min(Math.max(centre, 12 + half), pane.offsetWidth - 12 - half);
      shift = Math.round(clamped - centre);
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  });

  const PENS = ["#fde047", "#86efac", "#f9a8d4"];
</script>

{#if mounted}
  <div
    bind:this={ref}
    class="mk-bubble mk-bar {show ? 'on' : ''}"
    style="--shift:{shift}px"
    data-focus="bubble"
  >
    <div class="mk-bar-row">
      <span class="mk-ibtn"><Copy size={17} strokeWidth={1.75} /></span>
      <span class="mk-ibtn on"><Sparkles size={17} strokeWidth={1.75} /></span>
      <span class="mk-ibtn"><BookOpenText size={17} strokeWidth={1.75} /></span>
      <span class="mk-ibtn"><StickyNote size={17} strokeWidth={1.75} /></span>
      <span class="mk-ibtn"><Volume2 size={17} strokeWidth={1.75} /></span>
      <i class="mk-vrule"></i>
      <span class="mk-ibtn"
        ><Highlighter size={17} strokeWidth={1.75} /><i class="mk-pen" style="background:{PENS[0]}"
        ></i></span
      >
      <span class="mk-ibtn"
        ><Highlighter size={17} strokeWidth={1.75} /><i class="mk-pen" style="background:{PENS[1]}"
        ></i></span
      >
      <span class="mk-ibtn"
        ><Underline size={17} strokeWidth={1.75} /><i class="mk-pen" style="background:{PENS[2]}"
        ></i></span
      >
    </div>
    <i class="mk-caret down"></i>
  </div>
{/if}
