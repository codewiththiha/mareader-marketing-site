<script lang="ts">
  import Logo from './Logo.svelte';
  import Icon from './icons/Icon.svelte';
  import Link from './Link.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import { downloadHref, sourceRepo } from '../lib/content/downloads';
  import { device } from '../lib/platform.svelte';

  const target = $derived(downloadHref(device.value.os, device.value.arch));

  let scrolled = $state(false);
  let menuOpen = $state(false);

  $effect(() => {
    const onScroll = () => (scrolled = window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
</script>

<header class="bar" class:scrolled>
  <div class="wrap bar__inner">
    <Link href="/" class="brand" aria-label="Mareader, home">
      <Logo size={26} />
      <span class="brand__word">Mareader</span>
    </Link>

    <nav class="nav" aria-label="Sections">
      <Link href="/" class="nav__link">Overview</Link>
      <Link href="/releases" class="nav__link">Releases</Link>
      <Link href="/donate" class="nav__link">Donate</Link>
    </nav>

    <div class="tools">
      <a
        class="icon-link"
        href={sourceRepo}
        target="_blank"
        rel="noreferrer"
        aria-label="Source on GitHub"
      >
        <Icon name="github" size={18} />
      </a>
      <ThemeToggle />
      <a class="btn btn--primary bar__cta" href={target} download>Download</a>
      <button
        class="icon-link menu-button"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="small-nav"
        aria-label={menuOpen ? 'Close the menu' : 'Open the menu'}
        onclick={() => (menuOpen = !menuOpen)}
      >
        <Icon name={menuOpen ? 'close' : 'menu'} size={20} />
      </button>
    </div>
  </div>

  {#if menuOpen}
    <nav class="wrap small-nav" id="small-nav" aria-label="Menu">
      <Link href="/" class="small-nav__link" onclick={() => (menuOpen = false)}>Overview</Link>
      <Link href="/releases" class="small-nav__link" onclick={() => (menuOpen = false)}
        >Releases</Link
      >
      <Link href="/donate" class="small-nav__link" onclick={() => (menuOpen = false)}>Donate</Link>
      <a class="small-nav__link" href={sourceRepo} target="_blank" rel="noreferrer">Source</a>
    </nav>
  {/if}
</header>

<style>
  .bar {
    position: sticky;
    top: 0;
    z-index: 40;
    background: var(--paper);
    border-bottom: 1px solid transparent;
    transition: border-color var(--dur-2) var(--ease);
  }

  .bar.scrolled {
    border-bottom-color: var(--line);
  }

  .bar__inner {
    display: flex;
    align-items: center;
    gap: var(--sp-5);
    height: 64px;
  }

  /* A class handed to `Link` is invisible to Svelte's CSS, hence global. */
  :global(.brand) {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    color: var(--ink);
    text-decoration: none;
    flex: none;
  }

  .brand__word {
    font-family: var(--font-read);
    font-size: 1.22rem;
    letter-spacing: -0.01em;
    font-weight: 500;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: var(--sp-5);
    margin-left: var(--sp-4);
  }

  :global(.nav__link) {
    position: relative;
    color: var(--ink-soft);
    font-size: var(--text-base);
    text-decoration: none;
    padding-block: 4px;
    transition: color var(--dur-1) var(--ease);
  }

  :global(.nav__link:hover) {
    color: var(--ink);
  }

  /* The current section is a 2 px rule under the word, not a filled pill. */
  :global(.nav__link[aria-current='page']) {
    color: var(--ink);
  }

  :global(.nav__link[aria-current='page'])::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    bottom: -2px;
    height: 2px;
    background: var(--accent);
    border-radius: 2px;
  }

  .tools {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    margin-left: auto;
  }

  .icon-link {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: var(--r-sm);
    color: var(--ink-soft);
    text-decoration: none;
    transition:
      color var(--dur-1) var(--ease),
      background-color var(--dur-1) var(--ease);
  }

  .icon-link:hover {
    color: var(--ink);
    background: var(--paper-sink);
  }

  .bar__cta {
    min-height: 36px;
    padding-inline: 0.85rem;
    font-size: var(--text-sm);
  }

  .menu-button {
    display: none;
  }

  .small-nav {
    display: none;
    flex-direction: column;
    padding-bottom: var(--sp-3);
    border-top: 1px solid var(--line);
  }

  /* Forwarded to `Link`; see the note above. */
  :global(.small-nav__link) {
    padding: 0.7rem 0;
    color: var(--ink);
    text-decoration: none;
    font-size: var(--text-base);
    border-bottom: 1px solid var(--line);
  }

  @media (max-width: 720px) {
    .nav {
      display: none;
    }

    .menu-button {
      display: grid;
    }

    .small-nav {
      display: flex;
    }

    .icon-link[aria-label='Source on GitHub'] {
      display: none;
    }
  }

  @media (max-width: 420px) {
    .bar__cta {
      display: none;
    }

    .bar__inner {
      gap: var(--sp-3);
    }
  }
</style>
