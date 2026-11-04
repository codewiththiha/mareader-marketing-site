<script lang="ts">
  import Slide from "$lib/chrome/Slide.svelte";
  import AppleMark from "$lib/icons/AppleMark.svelte";
  import LinuxMark from "$lib/icons/LinuxMark.svelte";
  import WindowsMark from "$lib/icons/WindowsMark.svelte";
  import Download from "$lib/icons/lively/Download.svelte";
  import { checksumsUrl, GROUPS, latestDate, latestTag, OS_LABEL, primaryFor, releaseUrl, type KnownOs } from "$lib/site/downloads";
  import { router } from "$lib/site/router.svelte";
  import { platform } from "$lib/utils/platform.svelte";
  import { slideGroup } from "$lib/utils/slide.svelte";
  import icon from "../../assets/icon.png";

  const marks: Record<KnownOs, typeof AppleMark> = { mac: AppleMark, windows: WindowsMark, linux: LinuxMark };
  const groups = $derived(
    platform.os === "unknown" ? GROUPS : [...GROUPS].sort((a, b) => Number(b.os === platform.os) - Number(a.os === platform.os)),
  );
  const primary = $derived(primaryFor(platform.os, platform.arm));

  const group = slideGroup();
  const els: Record<string, HTMLElement | undefined> = {};
  const rest = () => {
    group.move(null);
  };
</script>

<div class="route-page dl-page">
  <header class="route-head">
    <p class="eyebrow">Download</p>
    <img src={icon} alt="" width={76} height={76} class="dl-icon" />
    <h1 class="serif">{platform.os === "unknown" ? "Pick your platform." : `Mareader for ${OS_LABEL[platform.os]}.`}</h1>
    <p class="route-sub">
      Free and open source — about {primary.size}, no account, no subscription. {latestTag} came out {latestDate}, and every file below is
      that same release.
    </p>
    {#if platform.os !== "unknown"}
      <a class="btn btn-accent dl-cta" href={primary.url}>
        <Download />
        Download for {OS_LABEL[platform.os]}
      </a>
      <p class="dl-cta-sub">{primary.label} · {primary.sub} · {primary.size} — or choose another build below</p>
    {/if}
  </header>

  <div class="dl-grid">
    <Slide {group} radius={11} />
    {#each groups as g, i (g.os)}
      {@const Mark = marks[g.os]}
      <section class="dl-card" class:mine={g.os === platform.os} style="--i:{i}" aria-label="{OS_LABEL[g.os]} downloads">
        <div class="dl-card-head">
          <span class="dl-os-icon"><Mark size={20} /></span>
          <span class="dl-card-title">
            <h2>{OS_LABEL[g.os]}</h2>
            <p>{g.requires}</p>
          </span>
          {#if g.os === platform.os}<span class="mine-pill">Yours</span>{/if}
        </div>
        <div class="dl-rows" role="group" aria-label="{OS_LABEL[g.os]} builds" onmouseleave={rest}>
          {#each g.options as o (o.id)}
            <a
              class="dl-row"
              href={o.url}
              rel="noopener noreferrer"
              bind:this={els[o.id]}
              onmouseenter={() => {
                group.move(els[o.id] ?? null);
              }}
              onfocus={() => {
                group.move(els[o.id] ?? null);
              }}
            >
              <span class="dl-row-main">
                <strong>{o.label}</strong>
                <small>{o.hint}</small>
              </span>
              <span class="dl-row-side">
                <span>{o.sub}</span>
                <small>{o.size}</small>
              </span>
              <svg class="dl-go" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path
                  d="M8 3v10m0 0 3.5-3.5M8 13l-3.5-3.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
          {/each}
        </div>
        <p class="dl-note">{g.note}</p>
      </section>
    {/each}
  </div>

  <p class="dl-links">
    <a href={checksumsUrl} rel="noopener noreferrer">Checksums (SHA256)</a>
    <a href={router.href("releases")}>What’s new in {latestTag}</a>
    <a href={releaseUrl()} rel="noopener noreferrer">All files on GitHub</a>
  </p>
</div>
