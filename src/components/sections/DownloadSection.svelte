<script lang="ts">
  import { assetUrl, files, pick, releasesPage, VERSION } from '../../lib/content/downloads';
  import { device } from '../../lib/platform.svelte';
  import { reveal } from '../../lib/reveal';
  import Icon from '../icons/Icon.svelte';

  const systems = [
    { id: 'macos', name: 'macOS', requirement: 'macOS 11 or later' },
    { id: 'linux', name: 'Linux', requirement: 'glibc 2.35 or later' },
    { id: 'windows', name: 'Windows', requirement: 'Windows 10 or 11' },
  ] as const;

  const mine = $derived(pick(device.value.os, device.value.arch).primary?.file ?? '');
</script>

<section class="section section--sink" id="download" aria-labelledby="download-heading">
  <div class="wrap">
    <header class="head">
      <h2 class="heading" id="download-heading" use:reveal>Download</h2>
      <p class="body" use:reveal={{ delay: 70 }}>
        v{VERSION}, for macOS, Windows and Linux. Installing over an older version keeps your
        library, settings and highlights. <a href={releasesPage}>All releases</a>, including the
        checksums, are on GitHub.
      </p>
    </header>

    <div class="systems">
      {#each systems as system, index (system.id)}
        <div class="system" use:reveal={{ delay: index * 60 }}>
          <div class="system__head">
            <h3 class="system__name">{system.name}</h3>
            <span class="system__req">{system.requirement}</span>
          </div>
          <ul class="files">
            {#each files.filter((entry) => entry.os === system.id) as file (file.file)}
              <li class="file">
                <a class="file__link" href={assetUrl(file.file)}>
                  <span class="file__name">{file.file}</span>
                  {#if file.file === mine}
                    <span class="file__mine">your machine</span>
                  {/if}
                  <span class="file__note">{file.note}</span>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>

    <div class="after" use:reveal>
      <div class="after__col">
        <h3 class="after__title">The first launch</h3>
        <p class="after__body">
          The builds are not notarised yet, so macOS says it cannot verify Mareader — choose Done,
          then Open Anyway in Privacy &amp; Security. Windows asks for More info, then Run anyway.
          Linux asks nothing.
        </p>
      </div>
      <div class="after__col">
        <h3 class="after__title">Checking a download</h3>
        <p class="after__body">
          Every release publishes <code class="mono">SHA256SUMS</code>.
          <code class="mono">sha256sum -c SHA256SUMS --ignore-missing</code> on Linux,
          <code class="mono">shasum -a 256 -c</code> on a Mac.
        </p>
      </div>
      <div class="after__col">
        <h3 class="after__title">Source</h3>
        <p class="after__body">
          MIT licensed, built in the open. If you would rather compile it, Rust 1.95 or newer builds
          the workspace with <code class="mono">cargo run -p mareader</code>.
        </p>
      </div>
    </div>

    <a class="all" href={releasesPage}>
      Older versions and every file
      <Icon name="arrow-up-right" size={15} />
    </a>
  </div>
</section>

<style>
  .head {
    display: grid;
    grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr);
    gap: var(--sp-4) var(--sp-8);
    align-items: baseline;
    margin-bottom: clamp(24px, 4vw, 44px);
  }

  .systems {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--sp-6) var(--sp-7);
  }

  .system__head {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding-bottom: var(--sp-3);
    border-bottom: 1px solid var(--line-strong);
  }

  .system__name {
    font-size: var(--text-lg);
    font-weight: 500;
  }

  .system__req {
    font-size: var(--text-sm);
    color: var(--ink-muted);
  }

  .files {
    display: flex;
    flex-direction: column;
  }

  .file + .file {
    border-top: 1px solid var(--line);
  }

  .file__link {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-block: 0.8rem;
    color: var(--ink);
    text-decoration: none;
  }

  .file__name {
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
    font-size: 0.8rem;
    letter-spacing: -0.01em;
    overflow-wrap: anywhere;
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 0.22em;
    transition: text-decoration-color var(--dur-1) var(--ease);
  }

  .file__link:hover .file__name {
    text-decoration-color: var(--line-strong);
  }

  .file__mine {
    font-size: var(--text-xs);
    color: var(--accent);
    letter-spacing: 0.02em;
  }

  .file__note {
    font-size: var(--text-sm);
    color: var(--ink-muted);
    line-height: 1.45;
  }

  .after {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--sp-5) var(--sp-7);
    margin-top: clamp(32px, 5vw, 56px);
    padding-top: var(--sp-5);
    border-top: 1px solid var(--line);
  }

  .after__title {
    font-size: var(--text-base);
    font-weight: 500;
    margin-bottom: 0.4em;
  }

  .after__body {
    font-size: var(--text-sm);
    line-height: 1.6;
    color: var(--ink-muted);
  }

  code {
    font-size: 0.85em;
    padding: 0.05em 0.3em;
    border-radius: var(--r-xs);
    background: var(--paper-deep);
    color: var(--ink-soft);
  }

  .all {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: clamp(28px, 4vw, 40px);
    font-size: var(--text-base);
    color: var(--ink);
    text-decoration: none;
    border-bottom: 1px solid var(--line-strong);
    padding-bottom: 2px;
  }

  .all:hover {
    border-bottom-color: var(--ink);
  }

  @media (max-width: 880px) {
    .head {
      grid-template-columns: 1fr;
    }

    .systems {
      grid-template-columns: 1fr;
      gap: 0;
    }

    .system {
      padding-block: var(--sp-5);
    }

    .system + .system {
      border-top: 1px solid var(--line);
    }

    .after {
      grid-template-columns: 1fr;
    }
  }
</style>
