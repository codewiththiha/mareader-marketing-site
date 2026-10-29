<script lang="ts">
  import { features } from '../../lib/content/features';
  import { reveal } from '../../lib/reveal';
  import Panes from '../icons/Panes.svelte';
  import Paper from '../icons/Paper.svelte';
  import Shelf from '../icons/Shelf.svelte';
  import Voice from '../icons/Voice.svelte';
  import Study from '../icons/Study.svelte';
  import Plume from '../icons/Plume.svelte';
  import type { FeatureId } from '../../lib/content/features';

  const glyphs: Record<FeatureId, typeof Panes> = {
    panes: Panes,
    paper: Paper,
    library: Shelf,
    voice: Voice,
    study: Study,
    native: Plume,
  };
</script>

<section class="section" aria-labelledby="features-heading">
  <div class="wrap">
    <header class="head">
      <h2 class="heading" id="features-heading" use:reveal>Built for the third hour of reading.</h2>
      <p class="lede" use:reveal={{ delay: 80 }}>
        Most readers are for opening a file once. Mareader is for the book you are halfway through,
        with the notes open beside it.
      </p>
    </header>

    <ul class="grid">
      {#each features as feature, index (feature.id)}
        {@const Glyph = glyphs[feature.id]}
        <li class="feature" use:reveal={{ delay: index * 45 }}>
          <span class="feature__mark" aria-hidden="true">
            <Glyph size={28} />
          </span>
          <div>
            <h3 class="feature__title">{feature.title}</h3>
            <p class="feature__body">{feature.body}</p>
          </div>
        </li>
      {/each}
    </ul>
  </div>
</section>

<style>
  .head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--sp-5) var(--sp-8);
    align-items: baseline;
    margin-bottom: clamp(28px, 5vw, 56px);
  }

  .head .heading {
    max-width: 18ch;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 var(--sp-8);
  }

  .feature {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: var(--sp-3);
    padding-block: clamp(20px, 2.6vw, 30px);
    border-top: 1px solid var(--line);
    align-items: start;
  }

  .feature__mark {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 1px solid var(--line);
    background: var(--paper-raised);
    color: var(--ink);
  }

  .feature__title {
    font-size: var(--text-lg);
    font-weight: 500;
    letter-spacing: -0.006em;
    margin-bottom: 0.35em;
  }

  .feature__body {
    color: var(--ink-soft);
    font-size: var(--text-base);
    line-height: 1.6;
    max-width: 44ch;
  }

  @media (max-width: 900px) {
    .head {
      grid-template-columns: 1fr;
      gap: var(--sp-4);
    }

    .grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 520px) {
    .feature {
      grid-template-columns: 44px 1fr;
      gap: var(--sp-3);
    }

    .feature__mark {
      width: 40px;
      height: 40px;
    }
  }
</style>
