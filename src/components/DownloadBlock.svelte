<script lang="ts">
  /**
   * The hero's one decision: a single file for the system asking, and a way to
   * say "not me" without a menu. docs/psychology.md § One door.
   */
  import { assetUrl, pick, VERSION } from '../lib/content/downloads';
  import { device } from '../lib/platform.svelte';
  import Icon from './icons/Icon.svelte';

  interface Props {
    /** Where "other platforms" points. */
    allHref?: string;
  }

  let { allHref = '#download' }: Props = $props();

  const chosen = $derived(pick(device.value.os, device.value.arch));
  const primary = $derived(chosen.primary);
  const isMac = $derived(device.value.os === 'macos');
  const known = $derived(primary !== null);

  const label = $derived(
    known
      ? `Download for ${device.value.os === 'macos' ? 'macOS' : device.value.os === 'windows' ? 'Windows' : 'Linux'}`
      : 'See the downloads',
  );

  const detail = $derived(
    primary
      ? `v${VERSION} · ${primary.arch === 'arm64' ? 'Apple silicon' : primary.arch === 'x64' ? '64-bit' : ''} · ${primary.file.split('.').pop()}`
      : 'macOS, Windows and Linux',
  );
</script>

<div class="download">
  <div class="download__row">
    {#if primary}
      <a class="btn btn--primary download__button" href={assetUrl(primary.file)} download>
        <span>{label}</span>
        <Icon name="arrow-down" size={17} />
      </a>
    {:else}
      <a class="btn btn--primary download__button" href={allHref}>
        <span>{label}</span>
        <Icon name="arrow-down" size={17} />
      </a>
    {/if}

    {#if isMac && !device.value.archConfirmed}
      <div class="arch" role="group" aria-label="Processor">
        <button
          type="button"
          class="arch__choice"
          aria-pressed={device.value.arch === 'arm64'}
          onclick={() => device.chooseArch('arm64')}>Apple silicon</button
        >
        <button
          type="button"
          class="arch__choice"
          aria-pressed={device.value.arch === 'x64'}
          onclick={() => device.chooseArch('x64')}>Intel</button
        >
      </div>
    {/if}
  </div>

  <p class="download__detail">
    <span class="muted">{detail}</span>
    {#if known}
      <span class="dot" aria-hidden="true">·</span>
      <a class="download__all" href={allHref}>Every file</a>
    {/if}
  </p>
</div>

<style>
  .download {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    align-items: flex-start;
  }

  .download__row {
    display: flex;
    width: 100%;
    align-items: center;
    gap: var(--sp-4);
    flex-wrap: wrap;
  }

  .download__button {
    min-height: 50px;
    padding-inline: 1.4rem;
    font-size: 1.02rem;
    gap: 0.65rem;
  }

  .download__button :global(svg) {
    transition: transform var(--dur-2) var(--ease);
  }

  .download__button:hover :global(svg) {
    transform: translateY(2px);
  }

  /* A two-segment control, hairlines only: no pill, no shadow. */
  .arch {
    display: inline-flex;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-sm);
    overflow: hidden;
    background: var(--paper-raised);
  }

  .arch__choice {
    padding: 0.5rem 0.7rem;
    font-size: var(--text-sm);
    color: var(--ink-soft);
    transition:
      background-color var(--dur-1) var(--ease),
      color var(--dur-1) var(--ease);
  }

  .arch__choice + .arch__choice {
    border-left: 1px solid var(--line-strong);
  }

  .arch__choice[aria-pressed='true'] {
    background: var(--paper-deep);
    color: var(--ink);
  }

  .download__detail {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--text-sm);
    flex-wrap: wrap;
  }

  .dot {
    color: var(--line-strong);
  }

  .download__all {
    color: var(--ink-soft);
    text-decoration: underline;
    text-decoration-color: var(--line-strong);
    text-underline-offset: 0.2em;
  }

  .download__all:hover {
    color: var(--ink);
    text-decoration-color: var(--ink-muted);
  }

  @media (max-width: 420px) {
    .download__button {
      width: 100%;
    }
  }
</style>
