<script lang="ts">
  /**
   * The section most marketing pages leave out. It is here because a reader
   * deciding whether to move their library deserves the limits before the
   * download, not after it. docs/psychology.md § Trust.
   */
  import { reveal } from '../../lib/reveal';

  const limits = [
    {
      term: 'Signing',
      body: 'The installers are not notarised by Apple or signed by Microsoft yet, so each system asks once on first launch. The release notes say exactly which button to press.',
    },
    {
      term: 'Sync',
      body: 'Your library stays on this computer. Syncing between machines is designed but not scheduled.',
    },
    {
      term: 'Linux',
      body: 'Builds are x86_64. ARM Linux and Windows on ARM have none yet.',
    },
    {
      term: 'Voices',
      body: 'Neural voices are downloads of 24 MB to 327 MB each. The system voices need no download and no account.',
    },
  ];
</script>

<section class="section" aria-labelledby="limits-heading">
  <div class="wrap limits">
    <div class="limits__intro">
      <h2 class="heading" id="limits-heading" use:reveal>What v0.0.5 doesn’t do.</h2>
      <p class="body" use:reveal={{ delay: 70 }}>
        Mareader is at 0.0.5. It reads well and installs cleanly, and it is still early. These are
        the limits, before you download rather than after.
      </p>
    </div>

    <dl class="limits__list">
      {#each limits as limit, index (limit.term)}
        <div class="limit" use:reveal={{ delay: index * 50 }}>
          <dt>{limit.term}</dt>
          <dd>{limit.body}</dd>
        </div>
      {/each}
    </dl>
  </div>
</section>

<style>
  .limits {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: clamp(24px, 5vw, 72px);
    align-items: start;
  }

  .limits__intro .heading {
    margin-bottom: 0.6em;
    max-width: 16ch;
  }

  .limits__list {
    margin: 0;
    display: grid;
    gap: 0;
  }

  .limit {
    display: grid;
    grid-template-columns: 7rem 1fr;
    gap: var(--sp-4);
    padding-block: var(--sp-4);
    border-top: 1px solid var(--line);
  }

  .limit:last-child {
    border-bottom: 1px solid var(--line);
  }

  dt {
    font-size: var(--text-sm);
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-muted);
    padding-top: 0.15em;
  }

  dd {
    margin: 0;
    font-size: var(--text-base);
    line-height: 1.6;
    color: var(--ink-soft);
    max-width: 56ch;
  }

  @media (max-width: 860px) {
    .limits {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 520px) {
    .limit {
      grid-template-columns: 1fr;
      gap: 0.35rem;
    }
  }
</style>
