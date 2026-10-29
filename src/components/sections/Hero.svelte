<script lang="ts">
  import DownloadBlock from '../DownloadBlock.svelte';
  import ReaderPreview from '../ReaderPreview.svelte';
  import { reveal } from '../../lib/reveal';
  import { VERSION } from '../../lib/content/downloads';
</script>

<section class="hero">
  <div class="wrap">
    <h1 class="display hero__title" use:reveal>
      A reader that gets <em>out of the way</em>.
    </h1>
    <p class="lede hero__lede" use:reveal={{ delay: 70 }}>
      Mareader reads PDF and EPUB on your own machine, natively. Pages drawn by a Rust renderer, up
      to four panes, papers you can tint — and no webview between you and the book.
    </p>
    <div use:reveal={{ delay: 130 }}>
      <DownloadBlock allHref="#download" />
    </div>
    <p class="fine" use:reveal={{ delay: 180 }}>
      Version {VERSION} · free and open source, MIT · macOS, Windows and Linux
    </p>
  </div>

  <div class="wrap hero__window" use:reveal={{ delay: 220 }}>
    <ReaderPreview mode="light" tint="none" texture="paper" panes={2} />
  </div>
</section>

<style>
  .hero {
    padding-top: clamp(32px, 5.5vw, 72px);
    padding-bottom: clamp(40px, 6vw, 80px);
  }

  .hero__title {
    max-width: 15ch;
  }

  /* The headline's voice is one italic phrase, set in the reading face. */
  .hero__title em {
    font-style: italic;
    font-weight: 300;
  }

  .hero__lede {
    margin-top: clamp(18px, 2.4vw, 26px);
    max-width: 58ch;
  }

  .hero :global(.download) {
    margin-top: clamp(24px, 3.4vw, 36px);
  }

  .fine {
    margin-top: var(--sp-4);
    font-size: var(--text-sm);
    color: var(--ink-muted);
  }

  .hero__window {
    margin-top: clamp(36px, 6vw, 76px);
  }
</style>
