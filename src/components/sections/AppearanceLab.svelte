<script lang="ts">
  /**
   * The one interactive section: it does what the app's appearance popover does,
   * on a drawing of the app's window. Three controls, no more — each answers a
   * question a reader actually asks ("can I make it warm?", "can it be dark?").
   */
  import ReaderPreview from '../ReaderPreview.svelte';
  import {
    modes,
    tints,
    textures,
    type Mode,
    type Tint,
    type TextureKind,
  } from '../../lib/appearance';
  import { reveal } from '../../lib/reveal';

  let mode = $state<Mode>('light');
  let tint = $state<Tint>('sepia');
  let texture = $state<TextureKind | 'none'>('paper');

  const summary = $derived(
    [
      modes.find((entry) => entry.id === mode)?.label,
      tints.find((entry) => entry.id === tint)?.label,
      textures.find((entry) => entry.id === texture)?.label,
    ]
      .filter((word) => word && word !== 'None')
      .join(' · '),
  );
</script>

<section class="section section--sink" aria-labelledby="lab-heading">
  <div class="wrap lab">
    <div class="lab__copy">
      <h2 class="heading" id="lab-heading" use:reveal>The page is the app.</h2>
      <p class="body" use:reveal={{ delay: 70 }}>
        Chrome is translucent and quiet, and the paper fills everything the page does not. Change a
        mode, a tint or a texture and the whole window follows in one frame — the pages are not
        redrawn, so the book never jumps.
      </p>

      <div class="controls" use:reveal={{ delay: 120 }}>
        <fieldset class="control">
          <legend class="label">Paper</legend>
          <div class="segmented">
            {#each modes as entry (entry.id)}
              <button
                type="button"
                aria-pressed={mode === entry.id}
                onclick={() => (mode = entry.id)}
              >
                {entry.label}
              </button>
            {/each}
          </div>
        </fieldset>

        <fieldset class="control">
          <legend class="label">Tint</legend>
          <div class="swatches">
            {#each tints as entry (entry.id)}
              <button
                type="button"
                class="swatch"
                aria-pressed={tint === entry.id}
                onclick={() => (tint = entry.id)}
                title={entry.label}
              >
                <span
                  class="swatch__dot"
                  class:swatch__dot--none={entry.id === 'none'}
                  style:background={entry.id === 'none' ? 'var(--paper-raised)' : entry.swatch}
                ></span>
                <span class="visually-hidden">{entry.label}</span>
              </button>
            {/each}
          </div>
        </fieldset>

        <fieldset class="control">
          <legend class="label">Texture</legend>
          <div class="segmented">
            {#each textures as entry (entry.id)}
              <button
                type="button"
                aria-pressed={texture === entry.id}
                onclick={() => (texture = entry.id)}
              >
                {entry.label}
              </button>
            {/each}
          </div>
        </fieldset>
      </div>

      <p class="summary" aria-live="polite">{summary}</p>
    </div>

    <figure class="lab__window" use:reveal={{ delay: 60 }}>
      <ReaderPreview {mode} {tint} {texture} panes={1} />
      <figcaption>
        A drawing of the reader’s window, built from the app’s own colour tokens. The real one has
        the same controls in its appearance popover.
      </figcaption>
    </figure>
  </div>
</section>

<style>
  .lab {
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
    gap: clamp(28px, 5vw, 64px);
    align-items: start;
  }

  .lab__copy .heading {
    margin-bottom: 0.6em;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
    margin-top: var(--sp-6);
  }

  .control {
    border: 0;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .control legend {
    padding: 0;
    margin-bottom: 0.45rem;
  }

  .segmented {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 2px;
    padding: 3px;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    background: var(--paper-raised);
  }

  .segmented button {
    padding: 0.36rem 0.68rem;
    border-radius: 5px;
    font-size: var(--text-sm);
    color: var(--ink-soft);
    transition:
      background-color var(--dur-1) var(--ease),
      color var(--dur-1) var(--ease);
  }

  .segmented button:hover {
    color: var(--ink);
    background: var(--paper-sink);
  }

  .segmented button[aria-pressed='true'] {
    background: var(--ink);
    color: var(--paper);
  }

  .swatches {
    display: flex;
    gap: 8px;
  }

  .swatch {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid var(--line);
    background: var(--paper-raised);
    transition:
      border-color var(--dur-1) var(--ease),
      transform var(--dur-1) var(--ease);
  }

  .swatch:hover {
    transform: translateY(-1px);
    border-color: var(--line-strong);
  }

  .swatch__dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgb(0 0 0 / 8%);
  }

  .swatch__dot--none {
    border: 1px dashed var(--line-strong);
    box-shadow: none;
  }

  .swatch[aria-pressed='true'] {
    border-color: var(--ink);
    box-shadow: 0 0 0 1px var(--ink);
  }

  .summary {
    margin-top: var(--sp-4);
    font-size: var(--text-sm);
    color: var(--ink-muted);
    font-variant-numeric: tabular-nums;
    min-height: 1.4em;
  }

  .lab__window {
    margin: 0;
  }

  figcaption {
    margin-top: 0.9rem;
    font-size: var(--text-sm);
    line-height: 1.5;
    color: var(--ink-muted);
    max-width: 46ch;
  }

  @media (max-width: 940px) {
    .lab {
      grid-template-columns: 1fr;
    }

    .controls {
      gap: var(--sp-3);
    }
  }
</style>
