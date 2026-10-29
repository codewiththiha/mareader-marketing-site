<script lang="ts">
  /**
   * The reader's window, drawn in HTML and CSS from the app's own numbers:
   * a 48 px bar, a 288 px rail, pages that meet the pane's edges. The chrome
   * icons are Lucide's, the ones `crates/ui/src/icons.rs` names, so the drawing
   * can be read as the app rather than as an impression of it. Shot against
   * mareader2's own shot tool; docs/design.md § The window.
   */
  import Chrome from './icons/Chrome.svelte';
  import PaperTexture from './PaperTexture.svelte';
  import { windowPalette, type Mode, type TextureKind, type Tint } from '../lib/appearance';

  type Os = 'macos' | 'windows' | 'gnome';

  interface Props {
    os?: Os;
    mode?: Mode;
    tint?: Tint;
    texture?: TextureKind | 'none';
    panes?: 1 | 2;
    /** The rail, as the reader draws it once a document is open. */
    sidebar?: boolean;
    title?: string;
    /** Second pane shows the app's empty state instead of a page. */
    emptySecond?: boolean;
  }

  let {
    os = 'macos',
    mode = 'light',
    tint = 'none',
    texture = 'none',
    panes = 1,
    sidebar = false,
    title = 'The Wind in the Willows',
    emptySecond = false,
  }: Props = $props();

  const palette = $derived(windowPalette(mode, tint));

  const contents = [
    { label: 'I · The River Bank', page: 1, depth: 0 },
    { label: 'The Mole', page: 3, depth: 1 },
    { label: 'The River', page: 9, depth: 1 },
    { label: 'II · The Open Road', page: 22, depth: 0 },
    { label: 'The Caravan', page: 27, depth: 1 },
  ];

  const tabs = [
    { name: 'thumbnails', label: 'Thumbnails' },
    { name: 'outline', label: 'Outline' },
    { name: 'note', label: 'Notes' },
    { name: 'library', label: 'Library' },
  ] as const;
</script>

<div
  class="window"
  data-os={os}
  style:--chrome={palette.chrome}
  style:--chrome-ink={palette.chromeInk}
  style:--chrome-muted={palette.chromeMuted}
  style:--rail={palette.rail}
  style:--line={palette.line}
  style:--row={palette.row}
  style:--page={palette.page}
  style:--ink={palette.ink}
  style:--accent={palette.accent}
  style:--rule={palette.rule}
>
  <div class="top">
    {#if sidebar}
      <!-- The rail runs to the top, so the lights and its tools live here. -->
      <div class="rail__head" aria-hidden="true">
        {#if os === 'macos'}
          <span class="lights"><i></i><i></i><i></i></span>
        {/if}
        <span class="rail__tools">
          <Chrome name="panel-close" />
          <Chrome name="search" />
          <Chrome name="settings" />
        </span>
        <span class="rail__panel"><Chrome name="outline" /></span>
      </div>
    {/if}

    <div class="bar">
      <span class="tools" aria-hidden="true">
        {#if !sidebar}
          <Chrome name="panel" />
        {/if}
        <Chrome name="library" />
        <Chrome name="dictionary" />
      </span>
      <span class="bar__title">{title}</span>
      <span class="tools tools--trail" aria-hidden="true">
        <Chrome name="search" />
        <Chrome name="palette" />
        <Chrome name="menu" />
      </span>
      {#if os !== 'macos'}
        <span class="captions" aria-hidden="true">
          <i><Chrome name="minimise" size={12} /></i>
          <i><Chrome name="maximise" size={11} /></i>
          <i><Chrome name="close" size={12} /></i>
        </span>
      {/if}
    </div>
  </div>

  <div class="work">
    {#if sidebar}
      <aside class="rail" aria-hidden="true">
        <div class="rail__rows">
          {#each contents as row, index (row.label)}
            <div class="row" class:row--on={index === 0} class:row--sub={row.depth > 0}>
              <span class="row__label">{row.label}</span>
              <em class="row__page">{row.page}</em>
            </div>
          {/each}
        </div>

        <div class="rail__foot">
          {#each tabs as tab, index (tab.name)}
            <span class="tab" class:tab--on={index === 1}>
              <Chrome name={tab.name} size={15} />
              <b>{tab.label}</b>
            </span>
          {/each}
        </div>
      </aside>
    {/if}

    <div class="stage">
      {#each Array.from({ length: panes }, (_, index) => index) as pane (pane)}
        <div class="pane">
          <span class="pane__label" aria-hidden="true"
            >{pane === 0 ? 'Chapter 1: The River Bank' : 'Chapter 2: The Open Road'}</span
          >
          {#if pane === 1 && emptySecond}
            <div class="empty">
              <Chrome name="book-open" size={30} />
              <p class="empty__title">Open a book</p>
              <p class="empty__hint">Drop a PDF, EPUB, Markdown or text file here</p>
              <span class="empty__btn"><Chrome name="folder" size={15} /> Open…</span>
            </div>
          {:else}
            <div class="sheet">
              {#if texture !== 'none'}
                <PaperTexture kind={texture} scale={0.85} />
              {/if}
              <div class="sheet__text">
                {#if pane === 0}
                  <h3 class="sheet__head">The River Bank</h3>
                  <span class="sheet__rule"></span>
                  <p class="para">
                    <span class="dropcap">T</span>he Mole had been working very hard all the
                    morning, spring-cleaning his little home. First with brooms, then with dusters;
                    then on ladders and steps and chairs, with a brush and a pail of whitewash; till
                    he had dust in his throat and eyes, and splashes of whitewash all over his black
                    fur.
                  </p>
                  <p class="para">
                    Spring was moving in the air above and in the earth below and around him,
                    penetrating even his dark and lowly little house with its spirit of
                    <mark>divine discontent</mark>.
                  </p>
                {:else}
                  <h3 class="sheet__head">The Open Road</h3>
                  <span class="sheet__rule"></span>
                  <p class="para">
                    It was small wonder, then, that he suddenly flung down his brush on the floor,
                    and said “Bother!” and “O blow!” and also “Hang spring-cleaning!” and bolted out
                    of the house without even waiting to put on his coat.
                  </p>
                  <p class="para">
                    Something up above was calling him imperiously, and he made for the steep little
                    tunnel which answered in his case to the gravel drive.
                  </p>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/each}

      <span class="pill" aria-hidden="true">{panes === 2 ? '1–2 / 312' : '1 / 312'}</span>
    </div>
  </div>
</div>

<style>
  .window {
    position: relative;
    display: flex;
    flex-direction: column;
    height: clamp(300px, 31vw, 452px);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    background: var(--chrome);
    color: var(--chrome-muted);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    transition:
      background-color var(--dur-3) var(--ease),
      color var(--dur-3) var(--ease);
  }

  /* The top row is the rail's header and the bar, side by side. --- */
  .top {
    display: flex;
    flex: none;
    align-items: stretch;
  }

  .bar {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    height: 40px;
    flex: none;
    padding-inline: 12px;
  }

  .lights {
    display: flex;
    gap: 6px;
    margin-right: 6px;
  }

  .lights i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }

  .lights i:nth-child(1) {
    background: #ff5f57;
  }

  .lights i:nth-child(2) {
    background: #febc2e;
  }

  .lights i:nth-child(3) {
    background: #28c840;
  }

  .tools {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: none;
  }

  .tools :global(svg) {
    opacity: 0.92;
  }

  .tools--trail {
    margin-left: auto;
  }

  .bar__title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    max-width: 46%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 11.5px;
    font-weight: 500;
    letter-spacing: 0.005em;
    color: var(--chrome-ink);
  }

  /* The bar takes the rest of the row; its title centres in that space. */
  .bar {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  /* Windows and GNOME put their captions where macOS puts nothing. */
  .captions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: none;
    margin-left: 4px;
    color: var(--chrome-ink);
  }

  .captions i {
    display: grid;
    place-items: center;
    width: 22px;
    height: 18px;
    font-style: normal;
  }

  [data-os='gnome'] .captions i {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: color-mix(in oklab, var(--chrome-muted) 26%, transparent);
  }

  /* The work area: the rail, then as many panes as are open. --- */
  .work {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .rail {
    display: flex;
    flex-direction: column;
    width: 232px;
    flex: none;
    order: -1;
    background: var(--rail);
    border-right: 1px solid var(--line);
  }

  .rail__head {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 232px;
    flex: none;
    height: 40px;
    padding-inline: 12px;
    background: var(--rail);
    border-right: 1px solid var(--line);
    color: var(--chrome-muted);
  }

  .rail__tools {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .rail__tools :global(svg:first-child) {
    color: var(--chrome-ink);
  }

  /* The open panel's own icon, in the accent, at the rail's right edge. */
  .rail__panel {
    margin-left: auto;
    color: var(--accent);
  }

  .rail__rows {
    flex: 1;
    min-height: 0;
    padding-block: 6px;
    overflow: hidden;
  }

  .row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 5px 12px 5px 14px;
    font-size: 11.5px;
    color: var(--chrome-ink);
    border-left: 3px solid transparent;
  }

  .row--sub {
    padding-left: 28px;
    color: var(--chrome-muted);
  }

  .row--on {
    background: var(--row);
    border-left-color: var(--accent);
    font-weight: 500;
  }

  .row__label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .row__page {
    font-style: normal;
    font-variant-numeric: tabular-nums;
    color: var(--chrome-muted);
  }

  .rail__foot {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    flex: none;
    border-top: 1px solid var(--line);
    padding-block: 7px 8px;
  }

  .tab {
    display: grid;
    justify-items: center;
    gap: 4px;
    color: var(--chrome-muted);
  }

  .tab b {
    font-size: 9.5px;
    font-weight: 500;
    letter-spacing: 0.005em;
  }

  .tab--on {
    color: var(--accent);
  }

  .stage {
    position: relative;
    display: flex;
    flex: 1;
    min-width: 0;
    background: var(--page);
    transition: background-color var(--dur-3) var(--ease);
  }

  .pane {
    position: relative;
    display: flex;
    flex: 1;
    min-width: 0;
  }

  /* Two panes meet at a hairline, the handle the app drags. */
  .pane + .pane {
    border-left: 1px solid color-mix(in oklab, var(--accent) 22%, var(--line));
  }

  /* The chapter, floating where the app floats it, over the page's corner. */
  .pane__label {
    position: absolute;
    top: 9px;
    left: 14px;
    z-index: 1;
    font-size: 10px;
    letter-spacing: 0.005em;
    color: color-mix(in oklab, var(--ink) 52%, var(--page));
    pointer-events: none;
  }

  .sheet {
    position: relative;
    display: flex;
    flex: 1;
    min-width: 0;
    background: var(--page);
    color: var(--ink);
    overflow: hidden;
    transition: background-color var(--dur-3) var(--ease);
  }

  .sheet__text {
    padding: 30px clamp(18px, 5%, 44px) 34px;
    transition: color var(--dur-3) var(--ease);
  }

  .sheet__head {
    margin-top: 12px;
    font-family: var(--font-display);
    font-size: clamp(17px, 2.1vw, 23px);
    font-weight: 500;
    line-height: 1.15;
    letter-spacing: -0.01em;
    color: var(--ink);
    transition: color var(--dur-3) var(--ease);
  }

  /* The rule under the heading, in the app's orange. */
  .sheet__rule {
    display: block;
    width: 84px;
    height: 2px;
    margin-top: 9px;
    background: var(--rule);
    transition: background-color var(--dur-3) var(--ease);
  }

  .para {
    margin-top: 12px;
    font-family: var(--font-display);
    font-size: clamp(9.5px, 1.02vw, 11.5px);
    line-height: 1.62;
    color: var(--ink);
    text-wrap: pretty;
    transition: color var(--dur-3) var(--ease);
  }

  .para mark {
    background: color-mix(in oklab, var(--rule) 26%, transparent);
    color: inherit;
  }

  .dropcap {
    float: left;
    margin: 1px 4px 0 0;
    font-size: 2.4em;
    line-height: 0.86;
    color: var(--ink);
  }

  .empty {
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 5px;
    flex: 1;
    color: var(--chrome-muted);
    padding: 16px;
    text-align: center;
  }

  .empty__title {
    font-size: 12px;
    font-weight: 500;
    color: var(--chrome-ink);
  }

  .empty__hint {
    font-size: 10.5px;
  }

  .empty__btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 5px;
    padding: 4px 10px;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: color-mix(in oklab, var(--chrome-ink) 7%, transparent);
    font-size: 10.5px;
    color: var(--chrome-ink);
  }

  /* The page indicator, floating where the app floats it. */
  .pill {
    position: absolute;
    right: 10px;
    bottom: 9px;
    padding: 3px 8px;
    border-radius: 999px;
    background: color-mix(in oklab, var(--chrome) 82%, transparent);
    color: var(--chrome-ink);
    font-size: 9.5px;
    font-variant-numeric: tabular-nums;
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.12);
  }

  @media (max-width: 620px) {
    /* Below this the drawing is the page, not the furniture around it. */
    .rail,
    .rail__head {
      display: none;
    }

    .bar__title {
      display: none;
    }

    .tools {
      gap: 12px;
    }
  }
</style>
