<script lang="ts">
  import { onMount, tick } from "svelte";
  import { ArrowDownToLine, ArrowUpRight } from "@lucide/svelte";
  import Markdown from "@/lib/components/Markdown.svelte";
  import Pill from "@/lib/components/Pill.svelte";
  import PlatformMark from "@/lib/components/icons/PlatformMark.svelte";
  import { bestFor, KIND_LABEL, OS_LABEL } from "@/lib/downloads";
  import { platform } from "@/lib/platform.svelte";
  import { dateLabel, kindOf, sizeLabel } from "@/lib/releases/assets";
  import type { Release } from "@/lib/releases/data";
  import { releases } from "@/lib/releases/refresh.svelte";
  import { href } from "@/lib/router.svelte";

  let choice = $state<string | null | undefined>(undefined);
  let selected = $derived(
    releases.all.find((release) => release.tag === choice) ?? releases.all[0]
  );
  let selectedIndex = $derived(releases.all.findIndex((release) => release.tag === selected?.tag));
  let mobileOpen = $derived(
    choice === null
      ? null
      : (releases.all.find((release) => release.tag === choice)?.tag ?? releases.all[0]?.tag)
  );
  let best = $derived(
    platform.mobile
      ? null
      : bestFor(platform.os, platform.os === "mac" ? platform.macArch : platform.arch)
  );

  onMount(() => {
    void releases.refresh();
  });

  async function selectVersion(tag: string) {
    choice = tag;
    await tick();
    const panel = document.getElementById("release-panel");
    const top = panel?.getBoundingClientRect().top;
    if (top !== undefined && top < 76) {
      window.scrollBy({ top: top - 76, behavior: "auto" });
    }
  }

  function versionKey(event: KeyboardEvent, index: number) {
    const count = releases.all.length;
    let next: number;
    if (event.key === "ArrowDown") next = (index + 1) % count;
    else if (event.key === "ArrowUp") next = (index - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else return;
    event.preventDefault();
    const release = releases.all[next];
    if (!release) return;
    void selectVersion(release.tag);
    const tabs = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>(
      '[role="tab"]'
    );
    tabs?.[next]?.focus();
  }

  function toggleMobile(tag: string) {
    choice = mobileOpen === tag ? null : tag;
  }
</script>

{#snippet latestAction()}
  <div class="rel-action">
    {#if best}
      <a class="rel-action-primary" href={best.asset.url} data-testid="rel-latest-download">
        <PlatformMark os={best.os} size={16} />
        Download for {OS_LABEL[best.os]}
      </a>
      {#if best.os === "mac"}
        <Pill
          dense
          items={[
            { id: "arm64", label: "Apple Silicon" },
            { id: "x64", label: "Intel" }
          ]}
          active={platform.macArch}
          onSelect={(id) => platform.setMacArch(id === "x64" ? "x64" : "arm64")}
          ariaLabel="Mac chip"
        />
      {/if}
      <a class="rel-action-all" href={href("downloads")}>All downloads <ArrowUpRight size={14} /></a
      >
    {:else}
      <a class="rel-action-primary" href={href("downloads")}
        >Browse downloads <ArrowUpRight size={15} /></a
      >
    {/if}
  </div>
{/snippet}

{#snippet releaseBody(release: Release)}
  <Markdown source={release.body} />
  {#if release.assets.length}
    <section class="rel-files-section" aria-label={`Files for ${release.tag}`}>
      <div class="rel-files-heading">
        <h3>Files in this release</h3>
        <span>{release.assets.length} {release.assets.length === 1 ? "file" : "files"}</span>
      </div>
      <div class="rel-files">
        {#each release.assets as asset (asset.name)}
          {@const kind = kindOf(asset.name)}
          <a class="rel-file" href={asset.url} title={asset.name}>
            <span class="rel-file-name">{kind ? (KIND_LABEL[kind] ?? asset.name) : asset.name}</span
            >
            <span class="rel-file-size">{sizeLabel(asset.size)}</span>
            <ArrowDownToLine size={16} strokeWidth={1.7} aria-hidden="true" />
          </a>
        {/each}
      </div>
    </section>
  {/if}
{/snippet}

<div class="wrap page-pad releases-page">
  <header class="rel-intro">
    <h1>Release notes.</h1>
    <p>Every build of Mareader, what changed, and which file to take.</p>
  </header>

  {#if selected}
    <div class="rel-desktop">
      <aside class="rel-outline" aria-labelledby="release-outline-title">
        <div class="rel-outline-head">
          <h2 id="release-outline-title">Versions</h2>
          <span>{String(releases.all.length).padStart(2, "0")}</span>
        </div>
        <div
          class="rel-tabs"
          role="tablist"
          aria-labelledby="release-outline-title"
          aria-orientation="vertical"
        >
          {#each releases.all as release, index (release.tag)}
            {@const active = selected.tag === release.tag}
            <button
              type="button"
              role="tab"
              id={`release-tab-${index}`}
              class="rel-tab"
              aria-selected={active}
              aria-controls="release-panel"
              tabindex={active ? 0 : -1}
              onclick={() => selectVersion(release.tag)}
              onkeydown={(event) => versionKey(event, index)}
            >
              <span class="rel-tab-version">{release.tag}</span>
              {#if index === 0}<span class="rel-tab-latest">Latest</span>{/if}
              <span class="rel-tab-date">{dateLabel(release.date)}</span>
            </button>
          {/each}
        </div>
      </aside>

      <div
        id="release-panel"
        class="rel-panel"
        role="tabpanel"
        aria-labelledby={`release-tab-${selectedIndex}`}
        tabindex="0"
        data-version={selected.tag}
        data-testid="release-panel"
      >
        <div class="rel-panel-head">
          <div>
            <p class="rel-kicker">
              {selectedIndex === 0 ? "Latest release" : "From the archive"}
              {#if selectedIndex === 0 && releases.live}<span>Live</span>{/if}
            </p>
            <h2>{selected.tag}</h2>
            <p class="rel-panel-date">{dateLabel(selected.date)}</p>
          </div>
          {#if selectedIndex === 0}{@render latestAction()}{/if}
        </div>
        {@render releaseBody(selected)}
      </div>
    </div>

    <div class="rel-mobile" data-testid="release-accordion">
      <div class="rel-mobile-label">
        All versions <span>{String(releases.all.length).padStart(2, "0")}</span>
      </div>
      {#each releases.all as release, index (release.tag)}
        {@const isOpen = mobileOpen === release.tag}
        <section class="rel-mobile-row" class:open={isOpen}>
          <h2 class="rel-mobile-heading">
            <button
              type="button"
              id={`release-mobile-trigger-${index}`}
              class="rel-mobile-trigger"
              aria-expanded={isOpen}
              aria-controls={`release-mobile-panel-${index}`}
              onclick={() => toggleMobile(release.tag)}
            >
              <span class="rel-mobile-index" aria-hidden="true"
                >{String(index + 1).padStart(2, "0")}</span
              >
              <span class="rel-mobile-id">
                <strong>{release.tag}</strong>
                <span>{dateLabel(release.date)}</span>
              </span>
              {#if index === 0}<span class="rel-mobile-latest">Latest</span>{/if}
              <span class="rel-mobile-toggle" aria-hidden="true"></span>
            </button>
          </h2>
          <div
            id={`release-mobile-panel-${index}`}
            class="rel-mobile-panel"
            role="region"
            aria-labelledby={`release-mobile-trigger-${index}`}
            hidden={!isOpen}
          >
            {#if isOpen}
              {#if index === 0}{@render latestAction()}{/if}
              {@render releaseBody(release)}
            {/if}
          </div>
        </section>
      {/each}
    </div>
  {/if}
</div>
