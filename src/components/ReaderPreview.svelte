<script lang="ts">
  /**
   * The reader's window, drawn in HTML and CSS from the app's own colour tokens.
   * It is a drawing, not a screenshot, so it follows this page's theme and can be
   * repainted by the appearance controls without shipping seven bitmaps.
   * docs/design.md § The window.
   */
  import PaperTexture from './PaperTexture.svelte';
  import type { Mode, TextureKind, Tint } from '../lib/appearance';

  interface Props {
    mode?: Mode;
    tint?: Tint;
    texture?: TextureKind | 'none';
    panes?: 1 | 2;
    /** The rail of page thumbnails. Off in the narrow hero on small screens. */
    rail?: boolean;
  }

  let { mode = 'light', tint = 'none', texture = 'none', panes = 1, rail = true }: Props = $props();

  const bases: Record<
    Mode,
    { paper: string; ink: string; muted: string; chrome: string; line: string }
  > = {
    light: {
      paper: '#ffffff',
      ink: '#1f2937',
      muted: '#6b7280',
      chrome: '#ebedef',
      line: '#dadce1',
    },
    dark: {
      paper: '#131316',
      ink: '#e5e7eb',
      muted: '#9ca3af',
      chrome: '#16161a',
      line: '#2b2b31',
    },
    dim: { paper: '#1a1c1f', ink: '#c3c6cb', muted: '#8b8f96', chrome: '#202328', line: '#2e3238' },
    black: {
      paper: '#000000',
      ink: '#d4d4d8',
      muted: '#8a8a93',
      chrome: '#000000',
      line: '#27272a',
    },
  };

  const tintHues: Record<Exclude<Tint, 'none'>, string> = {
    sepia: '#c8a06a',
    green: '#6f9273',
    night: '#5a6f9e',
    parchment: '#cba76a',
  };

  function mix(base: string, hue: string, share: number): string {
    return `color-mix(in oklab, ${base}, ${hue} ${share}%)`;
  }

  const palette = $derived.by(() => {
    const base = bases[mode];
    if (tint === 'none') return base;
    const hue = tintHues[tint];
    // Dark papers tint the ink, light ones the paper (docs/design.md § Colour).
    const paper = mode === 'light' ? 13 : 9;
    const ink = mode === 'light' ? 14 : 10;
    return {
      paper: mix(base.paper, hue, paper),
      ink: mix(base.ink, hue, ink),
      muted: mix(base.muted, hue, ink),
      chrome: mix(base.chrome, hue, Math.round(paper * 0.6)),
      line: mix(base.line, hue, Math.round(paper * 0.7)),
    };
  });

  const pages = [
    { folio: 14, chapter: 'I · The River Bank' },
    { folio: 15, chapter: 'I · The River Bank' },
  ];
  const shown = $derived(pages.slice(0, panes));
</script>

<div
  class="window"
  style:--page-paper={palette.paper}
  style:--page-ink={palette.ink}
  style:--page-muted={palette.muted}
  style:--chrome={palette.chrome}
  style:--chrome-line={palette.line}
>
  <div class="bar">
    <span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="title">The Wind in the Willows<span class="title__separator">·</span>PDF</span>
    <span class="controls" aria-hidden="true">
      <span class="zoom">100%</span>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect
          x="1.8"
          y="2.8"
          width="12.4"
          height="10.4"
          rx="2"
          stroke="currentColor"
          stroke-width="1.3"
        />
        <path d="M8 2.8v10.4" stroke="currentColor" stroke-width="1.3" />
      </svg>
    </span>
  </div>

  <div class="view">
    {#if rail}
      <aside class="rail" aria-hidden="true">
        {#each [1, 3, 5] as folio (folio)}
          <div class="thumb" class:is-active={folio === 1}>
            <div class="thumb__page"><span></span><span></span><span></span><span></span></div>
            <em>{folio}</em>
          </div>
        {/each}
      </aside>
    {/if}

    <div class="panes">
      {#each shown as page (page.folio)}
        <div class="pane">
          <div class="sheet">
            {#if texture !== 'none'}
              <PaperTexture kind={texture} scale={0.9} />
            {/if}
            <div class="sheet__text">
              <p class="chapter">{page.chapter}</p>
              {#if page.folio === 14}
                <p class="para">
                  <span class="dropcap">T</span>he Mole had been working very hard all the morning,
                  spring-cleaning his little home. First with brooms, then with dusters; then on
                  ladders and steps and chairs, with a brush and a pail of whitewash; till he had
                  dust in his throat and eyes, and splashes of whitewash all over his black fur.
                </p>
                <p class="para">
                  Spring was moving in the air above and in the earth below and around him,
                  penetrating even his dark and lowly little house with its spirit of
                  <mark>divine discontent</mark>.
                </p>
              {:else}
                <p class="para">
                  It was small wonder, then, that he suddenly flung down his brush on the floor, and
                  said “Bother!” and “O blow!” and also “Hang spring-cleaning!” and bolted out of
                  the house without even waiting to put on his coat.
                </p>
                <p class="para">
                  Something up above was calling him imperiously, and he made for the steep little
                  tunnel which answered in his case to the gravel drive.
                </p>
              {/if}
            </div>
            <span class="folio">{page.folio}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .window {
    --page-paper: #ffffff;
    --page-ink: #1f2937;
    --page-muted: #6b7280;
    --chrome: #ebedef;
    --chrome-line: #dadce1;
    /* Muted alone fails 4.5:1 on light chrome; pull it to the ink. */
    --page-faint: color-mix(in oklab, var(--page-muted), var(--page-ink) 45%);

    display: flex;
    flex-direction: column;
    height: clamp(300px, 31vw, 452px);
    border-radius: var(--r-lg);
    border: 1px solid var(--chrome-line);
    background: var(--chrome);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    transition:
      background-color var(--dur-3) var(--ease),
      border-color var(--dur-3) var(--ease);
  }

  .bar {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    height: 36px;
    flex: none;
    padding-inline: 12px;
    border-bottom: 1px solid var(--chrome-line);
    color: var(--page-faint);
    transition:
      color var(--dur-3) var(--ease),
      border-color var(--dur-3) var(--ease);
  }

  .lights {
    display: flex;
    gap: 6px;
    flex: none;
  }

  .lights i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.26;
  }

  .title {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    font-size: 11.5px;
    letter-spacing: 0.01em;
    color: var(--page-ink);
    opacity: 0.88;
    white-space: nowrap;
    overflow: hidden;
    transition: color var(--dur-3) var(--ease);
  }

  .title__separator {
    color: var(--page-faint);
    opacity: 0.8;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: none;
    font-size: 11px;
  }

  .zoom {
    font-variant-numeric: tabular-nums;
  }

  /* Not `.body`: app.css owns that class for running text with a measure. */
  .view {
    display: flex;
    flex: 1;
    min-height: 0;
    background: var(--page-paper);
    transition: background-color var(--dur-3) var(--ease);
  }

  .rail {
    flex: none;
    width: clamp(74px, 8vw, 104px);
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    overflow: hidden;
    background: var(--chrome);
    border-right: 1px solid var(--chrome-line);
    transition:
      background-color var(--dur-3) var(--ease),
      border-color var(--dur-3) var(--ease);
  }

  .thumb {
    display: flex;
    flex: 1 1 0;
    min-height: 0;
    flex-direction: column;
    gap: 3px;
    align-items: center;
  }

  .thumb__page {
    flex: 1;
    min-height: 0;
    width: 100%;
    border-radius: 2px;
    background: var(--page-paper);
    border: 1px solid var(--chrome-line);
    padding: 6px 5px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    transition: border-color var(--dur-2) var(--ease);
  }

  .thumb__page span {
    display: block;
    height: 1.5px;
    border-radius: 1px;
    background: var(--page-ink);
    opacity: 0.2;
  }

  .thumb__page span:nth-child(2) {
    width: 82%;
  }

  .thumb__page span:nth-child(3) {
    width: 92%;
  }

  .thumb__page span:nth-child(4) {
    width: 64%;
  }

  .thumb.is-active .thumb__page {
    border-color: var(--page-ink);
  }

  .thumb em {
    font-style: normal;
    font-size: 9.5px;
    color: var(--page-faint);
    font-variant-numeric: tabular-nums;
  }

  .panes {
    display: flex;
    flex: 1;
    min-width: 0;
    gap: 10px;
    padding: 12px 12px 0;
    background: var(--chrome);
    transition: background-color var(--dur-3) var(--ease);
  }

  .pane {
    flex: 1 1 0;
    min-width: 0;
  }

  .sheet {
    position: relative;
    height: 100%;
    background: var(--page-paper);
    border-radius: 3px 3px 0 0;
    box-shadow: 0 1px 0 var(--chrome-line);
    overflow: hidden;
    transition: background-color var(--dur-3) var(--ease);
  }

  .sheet__text {
    position: relative;
    padding: clamp(14px, 1.8vw, 24px) clamp(14px, 2vw, 26px);
    color: var(--page-ink);
    font-family: var(--font-read);
    font-size: clamp(11.5px, 0.95vw, 13.4px);
    line-height: 1.64;
    transition: color var(--dur-3) var(--ease);
  }

  .chapter {
    font-family: var(--font-ui);
    font-size: 0.7em;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--page-faint);
    margin-bottom: 0.85em;
  }

  .para {
    margin-bottom: 0.7em;
    text-align: justify;
    hyphens: auto;
  }

  .dropcap {
    float: left;
    font-size: 2.7em;
    line-height: 0.84;
    padding: 0.08em 0.09em 0 0;
    font-weight: 500;
  }

  mark {
    background: color-mix(in oklab, var(--page-ink), transparent 84%);
    color: inherit;
    border-radius: 2px;
    padding: 0 1px;
  }

  .folio {
    position: absolute;
    bottom: 8px;
    right: 14px;
    font-family: var(--font-ui);
    font-size: 9.5px;
    color: var(--page-faint);
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 760px) {
    .window {
      height: clamp(260px, 62vw, 340px);
    }

    .rail {
      display: none;
    }

    .panes {
      padding: 8px 8px 0;
      gap: 8px;
    }

    .pane:nth-child(2) {
      display: none;
    }
  }
</style>
