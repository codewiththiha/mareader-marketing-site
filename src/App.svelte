<script lang="ts">
  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import Home from './routes/Home.svelte';
  import Releases from './routes/Releases.svelte';
  import Donate from './routes/Donate.svelte';
  import NotFound from './routes/NotFound.svelte';
  import { router } from './lib/router.svelte';
  import { theme } from './lib/theme.svelte';
  import { device } from './lib/platform.svelte';

  theme.init();
  router.init();
  void device.init();

  const Page = $derived.by(() => {
    switch (router.path) {
      case '/':
        return Home;
      case '/releases':
        return Releases;
      case '/donate':
        return Donate;
      default:
        return NotFound;
    }
  });

  $effect(() => {
    const titles: Record<string, string> = {
      '/': 'Mareader — a calm reader for PDF and EPUB',
      '/releases': 'Release notes — Mareader',
      '/donate': 'Donate — Mareader',
    };
    document.title = titles[router.path] ?? 'Not found — Mareader';
  });
</script>

<a class="skip" href="#main">Skip to the page</a>
<Header />
<main id="main">
  <Page />
</main>
<Footer />

<style>
  .skip {
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 100;
  }

  .skip:focus-visible {
    left: 12px;
    top: 12px;
    padding: 0.6rem 0.9rem;
    background: var(--paper-raised);
    border: 1px solid var(--line-strong);
    border-radius: var(--r-sm);
    color: var(--ink);
    text-decoration: none;
  }
</style>
