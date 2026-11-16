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
        <span class="sup-alt-question">Are you from Myanmar?</span>
        <span class="sup-alt-detail">KBZPay &amp; Wave, right here</span>
      {:else}
        <span class="sup-alt-question">Prefer crypto?</span>
        <span class="sup-alt-detail">wallets for every chain</span>
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

  <section class="sup-story" aria-labelledby="support-why-title" data-testid="support-note">
    <div class="sup-story-heading">
      <p class="sup-story-label">A note from the maker</p>
      <h2 id="support-why-title">Why crypto?</h2>
    </div>
    <div class="sup-story-copy">
      <p>
        I live in Myanmar, where I can’t use PayPal, Stripe, or many other international payment
        services to receive donations. For now, crypto is how I can accept support from readers
        abroad.
      </p>
      <p>
        I come from a middle-class family in a developing country, and making Mareader takes time
        and resources. If you’re able to give, even a small donation helps me keep working on it and
        sharing it freely.
      </p>
      <p>
        No pressure, though. If donating isn’t possible, that’s completely okay. Reading with
        Mareader, sharing it with a friend, or sending a kind word means a lot, too. Thank you for
        being here.
      </p>
    </div>
  </section>
</div>
