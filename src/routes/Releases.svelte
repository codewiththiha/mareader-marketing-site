<script lang="ts">
  import { releases } from '../lib/content/releases';
  import { releasesPage } from '../lib/content/downloads';
  import { reveal } from '../lib/reveal';
  import Icon from '../components/icons/Icon.svelte';
  import DownloadBlock from '../components/DownloadBlock.svelte';

  const anchor = (version: string) => `v${version.replaceAll('.', '-')}`;
</script>

<div class="page">
  <div class="wrap">
    <header class="head">
      <h1 class="display" use:reveal>Release notes</h1>
      <p class="lede" use:reveal={{ delay: 60 }}>
        Every version since the first build, in the order it shipped. Newer releases gather the
        fixes from the ones before them, so the current notes are the ones worth reading.
      </p>
      <div class="head__cta" use:reveal={{ delay: 120 }}>
        <DownloadBlock allHref="#versions" />
      </div>
    </header>

    <div class="layout" id="versions">
      <nav class="index" aria-label="Versions">
        <p class="label">Versions</p>
        <ul>
          {#each releases as release (release.version)}
            <li>
              <a href={`#${anchor(release.version)}`}>
                {release.version}
                <span>{release.headline}</span>
              </a>
            </li>
          {/each}
        </ul>
        <a class="index__all" href={releasesPage} target="_blank" rel="noreferrer">
          Everything on GitHub
          <Icon name="arrow-up-right" size={13} />
        </a>
      </nav>

      <div class="notes">
        {#each releases as release (release.version)}
          <article class="note" id={anchor(release.version)} use:reveal>
            <header class="note__head">
              <h2 class="note__version">{release.version}</h2>
              {#if release.current}
                <span class="note__current">current</span>
              {/if}
              <span class="note__headline">{release.headline}</span>
            </header>
            <p class="note__tagline">{release.tagline}</p>

            <ul class="changes">
              {#each release.changes as change (change.title)}
                <li>
                  <h3>{change.title}</h3>
                  <p>{change.body}</p>
                </li>
              {/each}
            </ul>

            {#if release.fixes}
              <div class="fixes">
                <h3 class="fixes__title">Fixes</h3>
                <ul>
                  {#each release.fixes as fix (fix)}
                    <li>{fix}</li>
                  {/each}
                </ul>
              </div>
            {/if}

            <a
              class="note__link"
              href={`${releasesPage}/tag/v${release.version}`}
              target="_blank"
              rel="noreferrer"
            >
              Files for {release.version}
              <Icon name="arrow-up-right" size={13} />
            </a>
          </article>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .page {
    padding-block: clamp(36px, 6vw, 80px) clamp(56px, 8vw, 104px);
  }

  .head {
    max-width: min(100%, 760px);
    margin-bottom: clamp(32px, 5vw, 60px);
  }

  .head .lede {
    margin-top: clamp(16px, 2vw, 22px);
  }

  .head__cta {
    margin-top: var(--sp-5);
  }

  .layout {
    display: grid;
    grid-template-columns: 190px minmax(0, 1fr);
    gap: clamp(24px, 5vw, 64px);
    align-items: start;
  }

  .index {
    position: sticky;
    top: 88px;
  }

  .index ul {
    margin-top: var(--sp-3);
  }

  .index a {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding-block: 0.5rem;
    border-top: 1px solid var(--line);
    color: var(--ink);
    text-decoration: none;
    font-variant-numeric: tabular-nums;
    font-size: var(--text-base);
  }

  .index a span {
    font-size: var(--text-xs);
    color: var(--ink-muted);
  }

  .index a:hover {
    color: var(--accent);
  }

  .index__all {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    margin-top: var(--sp-4);
    font-size: var(--text-sm);
    color: var(--ink-muted);
    text-decoration: none;
  }

  .index__all:hover {
    color: var(--ink);
  }

  .notes {
    display: flex;
    flex-direction: column;
    gap: clamp(36px, 5vw, 64px);
  }

  .note {
    scroll-margin-top: 88px;
  }

  .note__head {
    display: flex;
    align-items: baseline;
    gap: 0.7rem;
    flex-wrap: wrap;
    padding-bottom: var(--sp-3);
    border-bottom: 1px solid var(--line-strong);
  }

  .note__version {
    font-family: var(--font-read);
    font-size: var(--text-xl);
    font-weight: 500;
    letter-spacing: -0.01em;
  }

  .note__current {
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
    border: 1px solid var(--accent-line);
    background: var(--accent-wash);
    border-radius: 999px;
    padding: 0.1rem 0.5rem;
  }

  .note__headline {
    font-size: var(--text-base);
    color: var(--ink-muted);
  }

  .note__tagline {
    margin-top: var(--sp-4);
    font-size: var(--text-lg);
    line-height: 1.5;
    color: var(--ink-soft);
    max-width: 58ch;
  }

  .changes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--sp-4) var(--sp-6);
    margin-top: var(--sp-5);
  }

  .changes h3 {
    font-size: var(--text-base);
    font-weight: 500;
    margin-bottom: 0.25em;
  }

  .changes p {
    font-size: var(--text-sm);
    line-height: 1.6;
    color: var(--ink-muted);
  }

  .fixes {
    margin-top: var(--sp-5);
    padding-top: var(--sp-4);
    border-top: 1px solid var(--line);
  }

  .fixes__title {
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-muted);
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .fixes ul {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .fixes li {
    font-size: var(--text-sm);
    color: var(--ink-soft);
    line-height: 1.55;
    padding-left: 1rem;
    position: relative;
  }

  .fixes li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.62em;
    width: 5px;
    height: 1px;
    background: var(--line-strong);
  }

  .note__link {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    margin-top: var(--sp-4);
    font-size: var(--text-sm);
    color: var(--ink);
    text-decoration: none;
    border-bottom: 1px solid var(--line-strong);
    padding-bottom: 1px;
  }

  .note__link:hover {
    border-bottom-color: var(--ink);
  }

  @media (max-width: 860px) {
    .layout {
      grid-template-columns: 1fr;
    }

    .index {
      position: static;
    }

    .index ul {
      display: flex;
      gap: var(--sp-3);
      flex-wrap: wrap;
    }

    .index a {
      border-top: 0;
    }

    .index a span {
      display: none;
    }

    .changes {
      grid-template-columns: 1fr;
    }
  }
</style>
