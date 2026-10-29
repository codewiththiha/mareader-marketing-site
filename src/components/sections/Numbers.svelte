<script lang="ts">
  import { reveal } from '../../lib/reveal';

  const stats = [
    {
      value: '12 MiB',
      label: 'peak page memory for a 14-page PDF',
      note: 'pdf.js asked for 128 MiB on the same document.',
    },
    {
      value: '4',
      label: 'panes in one window',
      note: 'Each with its own document, zoom and paper.',
    },
    {
      value: '0',
      label: 'webviews between you and the page',
      note: 'Rust, egui and wgpu. The page is a texture.',
    },
  ];
</script>

<section class="section" aria-labelledby="numbers-heading">
  <div class="wrap">
    <h2 class="visually-hidden" id="numbers-heading">Measured</h2>
    <dl class="stats">
      {#each stats as stat, index (stat.value)}
        <div class="stat" use:reveal={{ delay: index * 70 }}>
          <dt class="stat__value">{stat.value}</dt>
          <dd>
            <span class="stat__label">{stat.label}</span>
            <span class="stat__note">{stat.note}</span>
          </dd>
        </div>
      {/each}
    </dl>
    <p class="source">
      From the app’s own memory audit, 2026-10-13: peak memory above the process baseline with every
      page drawn at 150%. The pdf.js figure was measured in Node, which flatters Mareader — read it
      as an order of magnitude, not a benchmark.
    </p>
  </div>
</section>

<style>
  .stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--sp-6) var(--sp-7);
    margin: 0;
  }

  .stat {
    border-top: 1px solid var(--line);
    padding-top: var(--sp-4);
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .stat__value {
    font-family: var(--font-read);
    font-size: clamp(2.4rem, 1.7rem + 2.6vw, 3.6rem);
    line-height: 1;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  dd {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .stat__label {
    font-size: var(--text-base);
    color: var(--ink);
    max-width: 26ch;
    hyphens: none;
    text-wrap: pretty;
  }

  .stat__note {
    font-size: var(--text-sm);
    color: var(--ink-muted);
    line-height: 1.5;
    max-width: 28ch;
    hyphens: none;
  }

  .source {
    margin-top: clamp(28px, 4vw, 44px);
    font-size: var(--text-sm);
    line-height: 1.6;
    color: var(--ink-muted);
    max-width: 62ch;
    padding-top: var(--sp-4);
    border-top: 1px solid var(--line);
  }

  @media (max-width: 760px) {
    .stats {
      grid-template-columns: 1fr;
      gap: 0;
    }

    .stat {
      padding-block: var(--sp-5);
    }

    .stat + .stat {
      border-top: 1px solid var(--line);
    }
  }
</style>
