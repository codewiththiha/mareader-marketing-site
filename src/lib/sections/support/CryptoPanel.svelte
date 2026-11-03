<script lang="ts">
  // CryptoPanel — the EVM family shares one card; coins get their own
  import { ArrowUpRight } from "@lucide/svelte";
  import { WALLETS, shortAddress } from "@/lib/support/wallets";
  import Qr from "@/lib/components/Qr.svelte";
  import CopyButton from "@/lib/components/CopyButton.svelte";
  import ChainMark from "@/lib/components/icons/ChainMark.svelte";

  const evm = WALLETS[0];
  const coins = WALLETS.slice(1);
  let chainId = $state(evm.chains?.[0]?.id ?? "ethereum");
  let chain = $derived(evm.chains?.find((c) => c.id === chainId) ?? evm.chains?.[0]);
</script>

<div class="wallets">
  <section class="card wallet-hero" data-testid="wallet-evm">
    <div class="wallet-hero-copy">
      <h3 class="wallet-h">
        {#if chain}<ChainMark id={chain.mark} size={22} />{/if}
        {evm.name}
      </h3>
      <p class="wallet-note">
        {evm.note} Pick a network to open its explorer — the address never changes.
      </p>
      <div class="chain-chips" role="listbox" aria-label="Network">
        {#each evm.chains ?? [] as c (c.id)}
          <button
            type="button"
            role="option"
            aria-selected={c.id === chainId}
            class="chip {c.id === chainId ? 'on' : ''}"
            onclick={() => (chainId = c.id)}
          >
            <ChainMark id={c.mark} size={14} />
            <span>{c.name}</span>
          </button>
        {/each}
      </div>
      <div class="addr-row">
        <code class="addr">{evm.address}</code>
        <CopyButton text={evm.address} />
      </div>
      {#if chain?.explorer}
        <a class="explorer" href={chain.explorer(evm.address)} target="_blank" rel="noreferrer">
          Verify on {chain.name}
          <ArrowUpRight size={13} strokeWidth={1.9} />
        </a>
      {/if}
    </div>
    <div class="wallet-hero-qr">
      {#key chainId}
        <div class="qr-swap">
          {#if chain}
            <Qr value={evm.address} size={192} label="QR code for the EVM address">
              {#snippet center()}
                <ChainMark id={chain.mark} size={26} />
              {/snippet}
            </Qr>
          {/if}
        </div>
      {/key}
      <span class="qr-net">{chain?.name ?? "EVM"}</span>
    </div>
  </section>

  <div class="wallet-grid">
    {#each coins as w (w.id)}
      <section class="card wallet" data-testid="wallet-{w.id}">
        <h3 class="wallet-h">
          <ChainMark id={w.mark} size={19} />
          {w.name}
          <span class="coin">{w.coin}</span>
        </h3>
        <Qr value={w.address} size={158} label="QR code for the {w.name} address">
          {#snippet center()}
            <ChainMark id={w.mark} size={21} />
          {/snippet}
        </Qr>
        <div class="addr-row stacked">
          <code class="addr sm" title={w.address}>{shortAddress(w.address)}</code>
          <CopyButton text={w.address} />
        </div>
        <div class="wallet-links">
          {#if w.explorer}
            <a href={w.explorer(w.address)} target="_blank" rel="noreferrer">
              Explorer <ArrowUpRight size={12} strokeWidth={1.9} />
            </a>
          {/if}
          {#if w.note}<span class="wallet-note sm">{w.note}</span>{/if}
        </div>
      </section>
    {/each}
  </div>

  <p class="wallet-warn">
    Send each coin on its own network — tokens sent on the wrong chain are lost.
  </p>
</div>
