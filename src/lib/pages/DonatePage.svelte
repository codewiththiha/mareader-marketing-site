<script lang="ts">
  import { onMount } from "svelte";
  import Slide from "$lib/chrome/Slide.svelte";
  import ChainGlyph from "$lib/icons/lively/ChainGlyph.svelte";
  import CopyCheck from "$lib/icons/lively/CopyCheck.svelte";
  import Heart from "$lib/icons/lively/Heart.svelte";
  import QrSvg from "$lib/chrome/QrSvg.svelte";
  import { region } from "$lib/site/region.svelte";
  import { chunks, WALLETS, type Wallet } from "$lib/site/wallets";
  import { slideGroup } from "$lib/utils/slide.svelte";

  const rail = slideGroup();
  const nets = slideGroup();
  const mode = slideGroup();
  let wallet = $state<Wallet>(WALLETS[0]);
  let copied = $state<"" | "copied" | "selected">("");
  const railEls: Record<string, HTMLElement> = {};
  let addrEl = $state<HTMLElement | null>(null);
  const netEls: Record<string, HTMLElement> = {};
  const modeEls: Record<string, HTMLElement> = {};

  onMount(() => {
    requestAnimationFrame(() => {
      rail.move(railEls[wallet.id]);
      mode.move(modeEls[region.mode]);
      if (wallet.networks.length > 1) nets.move(netEls[wallet.networks[0]]);
    });
  });

  const pick = (w: Wallet) => {
    wallet = w;
    copied = "";
    rail.move(railEls[w.id]);
    if (w.networks.length > 1) nets.move(netEls[w.networks[0]]);
    else nets.move(null);
  };

  async function copy() {
    let how: "copied" | "selected" = "copied";
    try {
      await navigator.clipboard.writeText(wallet.address);
    } catch {
      how = "selected";
      if (addrEl) window.getSelection()?.selectAllChildren(addrEl);
    }
    copied = how;
    window.setTimeout(() => (copied = ""), 1600);
  }

  const LOCAL = [
    { name: "KBZ Pay", initial: "K" },
    { name: "Wave Pay", initial: "W" },
    { name: "AYA Pay", initial: "A" },
  ];
</script>

<div class="route-page">
  <header class="route-head">
    <p class="eyebrow"><Heart /> Support</p>
    <h1 class="serif">Keep it going.</h1>
    <p class="route-sub">
      Mareader is free and open source — no account, no ads, no subscription. If it earned a place on your desk, this is where support
      lands.
    </p>
  </header>

  <div
    role="group"
    aria-label="Support method"
    class="mode-seg"
    onmouseleave={() => {
      mode.move(modeEls[region.mode]);
    }}
  >
    <Slide group={mode} />
    <button
      type="button"
      class:sel={region.mode === "intl"}
      bind:this={modeEls.intl}
      onmouseenter={() => {
        mode.move(modeEls.intl);
      }}
      onfocus={() => {
        mode.move(modeEls.intl);
      }}
      onclick={() => {
        region.set("intl");
      }}
    >
      Crypto
    </button>
    <button
      type="button"
      class:sel={region.mode === "mm"}
      bind:this={modeEls.mm}
      onmouseenter={() => {
        mode.move(modeEls.mm);
      }}
      onfocus={() => {
        mode.move(modeEls.mm);
      }}
      onclick={() => {
        region.set("mm");
      }}
    >
      Myanmar
    </button>
  </div>
  {#if region.choice === "auto"}
    <button
      type="button"
      class="quiet-link"
      onclick={() => {
        region.set(region.mode === "mm" ? "intl" : "mm");
      }}
    >
      {region.mode === "mm" ? "Not from Myanmar? See crypto instead →" : "Are you from Myanmar? See local ways →"}
    </button>
  {/if}

  {#if region.mode === "intl"}
    <div class="give">
      <div
        role="group"
        aria-label="Wallets"
        class="w-rail"
        onmouseleave={() => {
          rail.move(railEls[wallet.id]);
        }}
      >
        <Slide group={rail} />
        {#each WALLETS as w (w.id)}
          <button
            type="button"
            class="w-btn"
            class:sel={w.id === wallet.id}
            bind:this={railEls[w.id]}
            onmouseenter={() => {
              rail.move(railEls[w.id]);
            }}
            onfocus={() => {
              rail.move(railEls[w.id]);
            }}
            onclick={() => {
              pick(w);
            }}
          >
            <ChainGlyph family={w.family} on={w.id === wallet.id} />
            <span>{w.label}</span>
            {#if w.networks.length > 1}<small>{w.networks.length}</small>{/if}
          </button>
        {/each}
      </div>

      <div class="give-card">
        <div class="give-head">
          <div>
            <h2>{wallet.label}</h2>
            <p>{wallet.note}</p>
          </div>
          <ChainGlyph family={wallet.family} on />
        </div>

        <div class="give-body">
          <div class="qr-box" class:copied><QrSvg text={wallet.address} /></div>
          <div class="give-side">
            <code class="addr-code"
              >{#each chunks(wallet.address) as c (c)}<span>{c}</span>{/each}</code
            >
            <div class="give-actions">
              <button type="button" class="btn btn-accent btn-sm" class:done={copied === "copied"} onclick={copy}>
                <CopyCheck done={copied === "copied"} />
                {copied === "copied" ? "Copied" : copied === "selected" ? "Selected — press Ctrl+C" : "Copy address"}
              </button>
            </div>
            {#if wallet.networks.length > 1}
              <div
                role="group"
                aria-label="Networks"
                class="net-chips"
                onmouseleave={() => {
                  nets.move(netEls[wallet.networks[0]]);
                }}
              >
                <Slide group={nets} />
                {#each wallet.networks as n (n)}
                  <button
                    type="button"
                    class="net-chip"
                    bind:this={netEls[n]}
                    onmouseenter={() => {
                      nets.move(netEls[n]);
                    }}
                    onfocus={() => {
                      nets.move(netEls[n]);
                    }}
                    onclick={() => {
                      nets.move(netEls[n]);
                    }}
                  >
                    {n}
                  </button>
                {/each}
              </div>
              <p class="give-hint">Same address on all of these — send from whichever you hold.</p>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="loc-tiles">
      {#each LOCAL as l (l.name)}
        <div class="loc-tile">
          <span class="loc-mark serif">{l.initial}</span>
          <span class="loc-name">{l.name}</span>
          <span class="soon-pill">Soon</span>
        </div>
      {/each}
    </div>
    <p class="route-sub center">
      Local transfers for Myanmar are being set up with the owner’s bank and wallet accounts. Until then, crypto above works from anywhere —
      and nothing about reading here ever waits on it.
    </p>
  {/if}

  <p class="route-more muted">Nothing here is required, ever. The book comes first.</p>
</div>
