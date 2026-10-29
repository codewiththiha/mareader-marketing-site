<script lang="ts">
  import Book from './icons/Book.svelte';
  import Icon from './icons/Icon.svelte';
  import Link from './Link.svelte';
  import { sourceRepo, releasesPage } from '../lib/content/downloads';
</script>

<footer class="foot">
  <div class="wrap foot__inner">
    <div class="foot__brand">
      <Link href="/" class="foot__logo" aria-label="Mareader, home">
        <Book size={22} />
        <span>Mareader</span>
      </Link>
      <p class="foot__note">A calm reader for PDF and EPUB. MIT licensed, built in the open.</p>
    </div>

    <nav class="foot__cols" aria-label="Footer">
      <div>
        <h2 class="foot__heading">Mareader</h2>
        <Link href="/" class="foot__link">Overview</Link>
        <Link href="/releases" class="foot__link">Release notes</Link>
        <Link href="/donate" class="foot__link">Donate</Link>
      </div>
      <div>
        <h2 class="foot__heading">Elsewhere</h2>
        <a class="foot__link" href={sourceRepo} target="_blank" rel="noreferrer">
          Source <Icon name="arrow-up-right" size={13} />
        </a>
        <a class="foot__link" href={releasesPage} target="_blank" rel="noreferrer">
          Releases <Icon name="arrow-up-right" size={13} />
        </a>
      </div>
    </nav>
  </div>

  <div class="wrap foot__base">
    <p>Pages drawn by hayro, books laid out by parley. No webview, no account, no telemetry.</p>
    <p>© 2026 Mareader</p>
  </div>
</footer>

<style>
  .foot {
    border-top: 1px solid var(--line);
    padding-top: clamp(40px, 6vw, 64px);
    padding-bottom: var(--sp-6);
    background: var(--paper);
  }

  .foot__inner {
    display: flex;
    justify-content: space-between;
    gap: var(--sp-7);
    flex-wrap: wrap;
  }

  :global(.foot__logo) {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--ink);
    text-decoration: none;
    font-family: var(--font-read);
    font-size: 1.15rem;
  }

  .foot__note {
    margin-top: 0.7rem;
    font-size: var(--text-sm);
    color: var(--ink-muted);
    max-width: 34ch;
    line-height: 1.6;
  }

  .foot__cols {
    display: flex;
    gap: clamp(32px, 6vw, 88px);
  }

  /* Forwarded to `Link`; global for the reason given above `.foot__logo`. */
  :global(.foot__link) {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: var(--text-sm);
    color: var(--ink-soft);
    text-decoration: none;
    padding-block: 0.28rem;
  }

  :global(.foot__link:hover) {
    color: var(--ink);
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .foot__heading {
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-muted);
    font-weight: 500;
    margin-bottom: 0.75rem;
  }

  .foot__base {
    display: flex;
    justify-content: space-between;
    gap: var(--sp-4);
    flex-wrap: wrap;
    margin-top: clamp(32px, 5vw, 56px);
    padding-top: var(--sp-4);
    border-top: 1px solid var(--line);
    font-size: var(--text-xs);
    color: var(--ink-muted);
  }
</style>
