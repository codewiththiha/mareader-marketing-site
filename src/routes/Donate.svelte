<script lang="ts">
  /**
   * Two ways to give, one page. Crypto is the default because it is the one that
   * works today; the local view is a mock until the owner supplies the accounts
   * and says so on the card. docs/donations.md.
   */
  import DonationCard from '../components/DonationCard.svelte';
  import Icon from '../components/icons/Icon.svelte';
  import { reveal } from '../lib/reveal';
  import { localMethods, wallets } from '../lib/content/donations';
  import { guessLocale } from '../lib/locale';
  import { sourceRepo } from '../lib/content/downloads';

  type View = 'crypto' | 'local';

  const fromMyanmar = guessLocale() === 'myanmar';
  let view = $state<View>('crypto');
  let promptDismissed = $state(false);

  const showPrompt = $derived(fromMyanmar && view === 'crypto' && !promptDismissed);
</script>

<div class="page">
  <div class="wrap">
    <header class="head">
      <h1 class="display" use:reveal>Keep Mareader free.</h1>
      <p class="lede" use:reveal={{ delay: 60 }}>
        Mareader is free, MIT licensed and made by one person between releases. A donation pays for
        the Apple and Microsoft signing certificates that would end the first-launch warnings, and
        for the weeks each version takes.
      </p>
    </header>

    <div class="tabs" role="tablist" aria-label="Ways to give" use:reveal={{ delay: 110 }}>
      <button
        type="button"
        role="tab"
        id="tab-crypto"
        aria-selected={view === 'crypto'}
        aria-controls="panel-crypto"
        onclick={() => (view = 'crypto')}>Crypto</button
      >
      <button
        type="button"
        role="tab"
        id="tab-local"
        aria-selected={view === 'local'}
        aria-controls="panel-local"
        onclick={() => (view = 'local')}>Myanmar</button
      >
    </div>

    {#if showPrompt}
      <p class="prompt" use:reveal>
        <span>Are you in Myanmar? Local transfers are easier than crypto there.</span>
        <span class="prompt__actions">
          <button type="button" class="prompt__switch" onclick={() => (view = 'local')}>
            Show local methods
            <Icon name="arrow-right" size={15} />
          </button>
          <button type="button" class="prompt__close" onclick={() => (promptDismissed = true)}>
            Not now
          </button>
        </span>
      </p>
    {/if}

    {#if view === 'crypto'}
      <div
        class="panel"
        id="panel-crypto"
        role="tabpanel"
        aria-labelledby="tab-crypto"
        use:reveal={{ delay: 40 }}
      >
        <ul class="families">
          {#each wallets as wallet, index (wallet.id)}
            <li
              class="family"
              class:family--wide={wallet.networks.length > 1}
              use:reveal={{ delay: index * 50 }}
            >
              <DonationCard {wallet} wide={wallet.networks.length > 1} />
            </li>
          {/each}
        </ul>

        <p class="advice" use:reveal>
          One address covers every EVM network, so the network you pick in your wallet is the only
          choice that matters — and a transfer on the wrong one cannot be recalled.
        </p>
      </div>
    {:else}
      <div
        class="panel"
        id="panel-local"
        role="tabpanel"
        aria-labelledby="tab-local"
        use:reveal={{ delay: 40 }}
      >
        <p class="local-intro" use:reveal>
          Wallet transfers are the usual way in Myanmar. The accounts are being collected — the
          cards below show the shape they will take, not numbers to send to.
        </p>
        <ul class="locals">
          {#each localMethods as method, index (method.id)}
            <li class="local" use:reveal={{ delay: index * 50 }}>
              <div class="local__top">
                <h2 class="local__name">{method.name}</h2>
                <span class="local__state">{method.ready ? 'Ready' : 'Coming soon'}</span>
              </div>
              <p class="local__number mono">{method.placeholder}</p>
              <p class="local__note">{method.note}</p>
            </li>
          {/each}
        </ul>
        <p class="advice" use:reveal>
          Want to give now? <a href={`${sourceRepo}/issues`} target="_blank" rel="noreferrer"
            >Open an issue on GitHub</a
          >
          and the details come back the same day.
        </p>
      </div>
    {/if}

    <div class="thanks" use:reveal>
      <div>
        <h2 class="thanks__title">Other ways to help</h2>
        <p class="thanks__body">
          A bug report with the file that broke, a note about a book that laid out badly, or telling
          one person who reads a lot — all of it moves this faster than money does.
        </p>
      </div>
      <a class="btn" href={`${sourceRepo}/issues`} target="_blank" rel="noreferrer">
        Open an issue
        <Icon name="arrow-up-right" size={15} />
      </a>
    </div>
  </div>
</div>

<style>
  .page {
    padding-block: clamp(36px, 6vw, 80px) clamp(56px, 8vw, 104px);
  }

  /* `ch` would be measured in the body face here, not the display one. */
  .head {
    max-width: min(100%, 700px);
  }

  .head .lede {
    margin-top: clamp(16px, 2vw, 22px);
  }

  .tabs {
    display: inline-flex;
    gap: 2px;
    margin-top: clamp(28px, 4vw, 44px);
    padding: 3px;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    background: var(--paper-raised);
  }

  .tabs button {
    padding: 0.42rem 0.9rem;
    border-radius: 5px;
    font-size: var(--text-sm);
    color: var(--ink-soft);
    transition:
      background-color var(--dur-1) var(--ease),
      color var(--dur-1) var(--ease);
  }

  .tabs button:hover {
    color: var(--ink);
    background: var(--paper-sink);
  }

  .tabs button[aria-selected='true'] {
    background: var(--ink);
    color: var(--paper);
  }

  .prompt {
    display: flex;
    align-items: center;
    gap: var(--sp-3) var(--sp-5);
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: var(--sp-4);
    padding: 0.75rem 0.9rem;
    border: 1px solid var(--accent-line);
    border-radius: var(--r-md);
    background: var(--accent-wash);
    font-size: var(--text-sm);
    color: var(--ink);
  }

  .prompt__actions {
    display: flex;
    align-items: center;
    gap: var(--sp-4);
  }

  .prompt__switch {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-weight: 500;
    color: var(--accent);
  }

  .prompt__switch :global(svg) {
    transition: transform var(--dur-2) var(--ease);
  }

  .prompt__switch:hover :global(svg) {
    transform: translateX(3px);
  }

  .prompt__close {
    color: var(--ink-muted);
    font-size: var(--text-sm);
  }

  .prompt__close:hover {
    color: var(--ink);
  }

  .panel {
    margin-top: clamp(24px, 3vw, 34px);
  }

  .families {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--sp-5);
    list-style: none;
    padding: 0;
    margin: 0;
  }

  /* The family whose networks share one address gets the whole row. */
  .family--wide {
    grid-column: 1 / -1;
  }

  .advice {
    margin-top: var(--sp-5);
    font-size: var(--text-sm);
    line-height: 1.6;
    color: var(--ink-muted);
    max-width: 66ch;
  }

  .local-intro {
    font-size: var(--text-base);
    color: var(--ink-soft);
    max-width: 58ch;
  }

  .locals {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--sp-4);
    margin-top: var(--sp-5);
  }

  .local {
    padding: var(--sp-4);
    border: 1px dashed var(--line-strong);
    border-radius: var(--r-md);
    background: var(--paper-sink);
  }

  .local__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-2);
  }

  .local__name {
    font-size: var(--text-base);
    font-weight: 500;
  }

  .local__state {
    font-size: var(--text-xs);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }

  .local__number {
    margin-top: 0.7rem;
    font-size: 1.05rem;
    color: var(--ink-soft);
    letter-spacing: 0.06em;
  }

  .local__note {
    margin-top: 0.35rem;
    font-size: var(--text-sm);
    color: var(--ink-muted);
  }

  .thanks {
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    gap: var(--sp-5);
    flex-wrap: wrap;
    margin-top: clamp(40px, 6vw, 72px);
    padding-top: var(--sp-5);
    border-top: 1px solid var(--line);
  }

  .thanks__title {
    font-size: var(--text-lg);
    font-weight: 500;
    margin-bottom: 0.4em;
  }

  .thanks__body {
    font-size: var(--text-base);
    color: var(--ink-soft);
    max-width: 54ch;
  }

  @media (max-width: 860px) {
    .families {
      grid-template-columns: 1fr;
    }

    .locals {
      grid-template-columns: 1fr;
    }
  }
</style>
