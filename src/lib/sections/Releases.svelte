<script lang="ts">
  // Releases — every build: its notes, files and first launch
  import { onMount } from "svelte";
  import { releases } from "@/lib/releases/refresh.svelte";
  import { dateLabel, summaryOf, kindOf, sizeLabel } from "@/lib/releases/assets";
  import { KIND_LABEL } from "@/lib/downloads";
  import DownloadPanel from "@/lib/components/DownloadPanel.svelte";
  import Markdown from "@/lib/components/Markdown.svelte";
  import { reveal } from "@/lib/actions/reveal.svelte";

  let open = $state<string | null>(null);
  let latest = $derived(releases.all[0]);
  let older = $derived(releases.all.slice(1));

  onMount(() => {
    void releases.refresh();
  });

  function toggle(tag: string) {
    open = open === tag ? null : tag;
  }
</script>

<div class="wrap page-pad">
  <header use:reveal class="reveal rel-top">
    <h1 class="h1">Release notes</h1>
    <p class="lede">Every build of Mareader, what changed, and which file to take.</p>
  </header>

  {#if latest}
    <section use:reveal class="reveal card rel-hero" data-testid="rel-latest">
      <div class="rel-hero-head">
        <div class="rel-hero-id">
          <span class="badge gold">{latest.tag}</span>
          <span class="rel-date">{dateLabel(latest.date)}</span>
          {#if releases.live}<span class="dl-live" title="fetched live from GitHub">live</span>{/if}
        </div>
        <DownloadPanel variant="compact" />
      </div>
      <Markdown source={latest.body} />
    </section>
  {/if}

  <h2 class="h2 rel-older-h">Earlier releases</h2>
  <div class="rel-list">
    {#each older as r (r.tag)}
      {@const isOpen = open === r.tag}
      <div class="card rel-row {isOpen ? 'open' : ''}">
        <button
          type="button"
          class="rel-row-head"
          aria-expanded={isOpen}
          onclick={() => toggle(r.tag)}
        >
          <span class="badge">{r.tag}</span>
          <span class="rel-date">{dateLabel(r.date)}</span>
          <span class="rel-sum">{summaryOf(r.body)}</span>
          <span class="rel-chev" aria-hidden="true"></span>
        </button>
        <div class="rel-fold">
          <div class="rel-fold-in">
            <Markdown source={r.body} />
            <div class="rel-files">
              {#each r.assets as a (a.name)}
                {@const k = kindOf(a.name)}
                {#if k && k !== "linux-pkgbuild"}
                  <a class="rel-file" href={a.url} title={a.name}>
                    {KIND_LABEL[k] ?? k}
                    <span>{sizeLabel(a.size)}</span>
                  </a>
                {/if}
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
