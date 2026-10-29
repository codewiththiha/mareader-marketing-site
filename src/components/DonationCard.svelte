<script lang="ts">
  /**
   * One address family. Nine EVM networks share a card because they share the
   * address: the picker moves the explorer link and the fee line, never the code.
   * Reading of the card: docs/donations.md.
   */
  import QrCode from './QrCode.svelte';
  import CopyField from './CopyField.svelte';
  import Icon from './icons/Icon.svelte';
  import type { Wallet } from '../lib/content/donations';

  interface Props {
    wallet: Wallet;
    /** Spread across the grid, with a bigger code and the network picker. */
    wide?: boolean;
  }

  let { wallet, wide = false }: Props = $props();

  const many = $derived(wallet.networks.length > 1);
  // Nothing is chosen on arrival, so the first network leads by being first.
  let chosen = $state<string | null>(null);
  const picked = $derived(wallet.networks.find((one) => one.id === chosen) ?? wallet.networks[0]);
</script>

<article class="card" class:wide>
  <header class="card__head">
    <div class="card__title">
      <h2 class="card__name">{wallet.name}</h2>
      {#if many}
        <span class="card__count">{wallet.networks.length} networks</span>
      {/if}
    </div>
    <p class="card__note">{wallet.note}</p>
  </header>

  <div class="card__body">
    <div class="card__code">
      <!-- The width is the card's; 208 is only the ceiling a phone may reach. -->
      <QrCode value={wallet.address} size={208} label={`${wallet.name} address, as a QR code`} />
    </div>

    <div class="card__send">
      <CopyField value={wallet.address} what={`${wallet.name} address`} />
    </div>

    {#if many}
      <div class="card__rail" role="group" aria-label={`Network on ${wallet.name}`}>
        {#each wallet.networks as network (network.id)}
          <button
            type="button"
            class="card__chip"
            aria-pressed={network.id === picked.id}
            onclick={() => (chosen = network.id)}>{network.name}</button
          >
        {/each}
      </div>
    {/if}

    <div class="card__meta">
      <a class="card__explorer" href={picked.url(wallet.address)} target="_blank" rel="noreferrer">
        View on {picked.explorer}
        <Icon name="arrow-up-right" size={13} />
      </a>
    </div>
  </div>
</article>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: var(--sp-3);
    height: 100%;
    padding: var(--sp-4);
    border: 1px solid var(--line);
    border-radius: var(--r-md);
    background: var(--paper-raised);
    transition: border-color var(--dur-2) var(--ease);
  }

  .card:hover {
    border-color: var(--line-strong);
  }

  .card__head {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .card__title {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    flex-wrap: wrap;
  }

  .card__name {
    font-size: var(--text-lg);
    font-weight: 500;
  }

  /* Said once, beside the name: how far this one address reaches. */
  .card__count {
    padding: 0.1rem 0.42rem;
    border-radius: 999px;
    background: var(--paper-sink);
    color: var(--ink-muted);
    font-size: var(--text-xs);
    letter-spacing: 0.01em;
  }

  .card__note {
    font-size: var(--text-sm);
    color: var(--ink-muted);
    line-height: 1.45;
    max-width: 52ch;
  }

  /* One code, one address, then whichever networks it reaches. */
  .card__body {
    display: grid;
    flex: 1;
    gap: var(--sp-3) var(--sp-4);
    grid-template-columns: 148px minmax(0, 1fr);
    grid-template-areas:
      'code send'
      'code meta';
    /* Address and link sit level with the code, not hanging off its top. */
    align-content: center;
  }

  .wide .card__body {
    align-content: start;
    grid-template-columns: 168px minmax(0, 1fr);
    grid-template-areas:
      'code send'
      'rail rail'
      'meta meta';
  }

  .card__code {
    grid-area: code;
    width: 148px;
    min-width: 0;
  }

  .wide .card__code {
    width: 168px;
  }

  .card__send {
    grid-area: send;
  }

  /* One line of address against the height of the code beside it. */
  .wide .card__send {
    align-self: center;
  }

  /* Cells, so nine networks fill the row instead of trailing off. */
  .card__rail {
    grid-area: rail;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    gap: 0.3rem;
    align-self: start;
  }

  /* Chips, not a select: every network is visible, and so is the pick. */
  .card__chip {
    min-height: 32px;
    padding: 0.25rem 0.65rem;
    text-align: center;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--paper);
    color: var(--ink-soft);
    font-size: var(--text-sm);
    transition:
      background-color var(--dur-1) var(--ease),
      border-color var(--dur-1) var(--ease),
      color var(--dur-1) var(--ease);
  }

  .card__chip:hover {
    border-color: var(--line-strong);
    color: var(--ink);
  }

  .card__chip[aria-pressed='true'] {
    border-color: var(--ink);
    background: var(--ink);
    color: var(--paper);
  }

  .card__meta {
    grid-area: meta;
    align-self: end;
  }

  .card__explorer {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
    font-size: var(--text-sm);
    color: var(--ink-muted);
    text-decoration: none;
  }

  .card__explorer:hover {
    color: var(--ink);
  }

  .card__explorer :global(svg) {
    transition: transform var(--dur-2) var(--ease);
  }

  .card__explorer:hover :global(svg) {
    transform: translate(2px, -2px);
  }

  @media (prefers-reduced-motion: reduce) {
    .card__explorer :global(svg) {
      transition: none;
    }
  }

  /* Below the two-column grid the card is narrower, so fewer chips per row. */
  @media (max-width: 1000px) {
    .card__rail {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .card__rail {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .card__body,
    .wide .card__body {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas:
        'code'
        'send'
        'rail'
        'meta';
    }

    .card__code,
    .wide .card__code {
      width: 100%;
      max-width: 208px;
      margin-inline: auto;
    }

    .card__chip {
      min-height: 36px;
    }

    .card__meta {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
