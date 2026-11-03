<script lang="ts">
  // Support — crypto everywhere, Myanmar by detection or one click
  import { ArrowRight } from "@lucide/svelte";
  import { support } from "@/lib/support/geo.svelte";
  import Pill from "@/lib/components/Pill.svelte";
  import CryptoPanel from "./support/CryptoPanel.svelte";
  import LocalPanel from "./support/LocalPanel.svelte";
  import { reveal } from "@/lib/actions/reveal.svelte";

  let method = $derived(support.method);
</script>

<div class="wrap page-pad">
  <header use:reveal class="reveal sup-top">
    <h1 class="h1">Support Mareader</h1>
    <p class="lede">
      Free, MIT licensed, built by one person. If it earns a place in your reading life, a tip keeps
      the builds coming.
    </p>
  </header>

  <div use:reveal class="reveal sup-switch">
    <Pill
      mode="choice"
      ariaLabel="Donation method"
      items={[
        { id: "crypto", label: "Crypto" },
        { id: "local", label: "Myanmar" }
      ]}
      active={method}
      onSelect={(id) => support.choose(id === "local" ? "local" : "crypto")}
    />
    <button type="button" class="sup-alt" onclick={() => support.flip()} data-testid="sup-flip">
      {#if method === "crypto"}
        Are you from Myanmar? <span>KBZPay &amp; Wave, right here</span>
      {:else}
        Prefer crypto? <span>wallets for every chain</span>
      {/if}
      <ArrowRight size={14} strokeWidth={1.9} class="sup-alt-arrow" />
    </button>
  </div>

  {#key method}
    <div class="panel-in" data-testid="sup-panel">
      {#if method === "crypto"}
        <CryptoPanel />
      {:else}
        <LocalPanel />
      {/if}
    </div>
  {/key}
</div>
