<script lang="ts">
  // SelectionBar — bar over selected word
  import { Copy, BookSearch, Headphones, StickyNote, Highlighter, Underline } from "@lucide/svelte";

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

  const FULL = "#ffff00";
  const UNDER = "#1677ff";
</script>

<!-- the app's own AI mark: strokes inside a rounded frame -->
{#snippet aiMark()}
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <rect x="2.5" y="4.5" width="19" height="15" rx="4" />
    <path d="M6.5 16 9.25 8 12 16" />
    <path d="M7.6 13.2h3.3" />
    <path d="M16.5 8v8" />
    <path d="M15 8h3" />
    <path d="M15 16h3" />
  </svg>
{/snippet}

{#if mounted}
  <div
    bind:this={ref}
    class="mk-bubble mk-bar {show ? 'on' : ''}"
    style="--shift:{shift}px"
    data-focus="bubble"
  >
    <div class="mk-bar-row">
      <span class="mk-ibtn"><Copy size={17} strokeWidth={1.75} /></span>
      <span class="mk-ibtn">{@render aiMark()}</span>
      <span class="mk-ibtn"><BookSearch size={17} strokeWidth={1.75} /></span>
      <span class="mk-ibtn"><Headphones size={17} strokeWidth={1.75} /></span>
      <span class="mk-ibtn"><StickyNote size={17} strokeWidth={1.75} /></span>
      <i class="mk-vrule"></i>
      <span class="mk-ibtn"
        ><Highlighter size={17} strokeWidth={1.75} /><i class="mk-pen" style="background:{FULL}"
        ></i></span
      >
      <span class="mk-ibtn"
        ><Underline size={17} strokeWidth={1.75} /><i class="mk-pen" style="background:{UNDER}"
        ></i></span
      >
    </div>
    <i class="mk-caret down"></i>
  </div>
{/if}
