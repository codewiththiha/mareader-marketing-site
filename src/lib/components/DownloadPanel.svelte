<script lang="ts">
  // DownloadPanel — detected system first, every other one click away
  import { platform } from "@/lib/platform.svelte";
  import { releases } from "@/lib/releases/refresh.svelte";
  import { assetOf, sizeLabel } from "@/lib/releases/assets";
  import { bestFor, FIRST_LAUNCH, OS_LABEL } from "@/lib/downloads";
  import { RELEASES } from "@/lib/constants";
  import PlatformMark from "./icons/PlatformMark.svelte";
  import Pill from "./Pill.svelte";
  import type { OS } from "@/lib/platform";

  let { variant = "full" }: { variant?: "full" | "compact" } = $props();

  const ARCH_KEY = "mareader-mac-arch";
  function loadPick(): "arm64" | "x64" | null {
    try {
      const v = localStorage.getItem(ARCH_KEY);
      return v === "arm64" || v === "x64" ? v : null;
    } catch {
      return null;
    }
  }
  let userPick = $state<"arm64" | "x64" | null>(null);
  let mounted = $state(false);
  $effect(() => {
    if (mounted) return;
    mounted = true;
    userPick = loadPick();
  });

  let arch = $derived(userPick ?? (platform.arch === "x64" ? "x64" : "arm64"));
  let best = $derived(bestFor(platform.os, platform.mobile ? "" : arch));
  let rel = $derived(releases.latest);
  let tagUrl = $derived(`${RELEASES}/tag/${rel?.tag ?? ""}`);
  const OTHERS = ["mac", "windows", "linux"] as const;

  function pickArch(a: "arm64" | "x64") {
    userPick = a;
    try {
      localStorage.setItem(ARCH_KEY, a);
    } catch {
      // the pick lives for this page only
    }
  }

  function otherBest(os: OS) {
    return bestFor(os, os === "mac" ? arch : "");
  }
</script>

<div class="dl" data-variant={variant}>
  {#if best}
    <div class="dl-primary">
      <a class="btn-primary dl-btn" href={best.asset.url} data-testid="dl-main">
        <PlatformMark os={best.os} size={18} />
        Download for {OS_LABEL[best.os]}
      </a>
      <p class="dl-meta">{best.meta}</p>
      {#if best.os === "mac"}
        <div class="dl-arch">
          <Pill
            dense
            items={[
              { id: "arm64", label: "Apple Silicon" },
              { id: "x64", label: "Intel" }
            ]}
            active={arch}
            onSelect={(id) => pickArch(id === "x64" ? "x64" : "arm64")}
            ariaLabel="Mac chip"
          />
        </div>
      {/if}
    </div>
    {#if variant === "full"}
      <div class="dl-alt">
        <span class="dl-alt-label">Also for</span>
        {#each OTHERS.filter((o) => o !== best.os) as os (os)}
          {@const b = otherBest(os)}
          {#if b}
            <a class="btn-ghost dl-alt-btn" href={b.asset.url} title={b.meta}>
              <PlatformMark {os} size={16} />
              {OS_LABEL[os]}
            </a>
          {/if}
        {/each}
      </div>
      <details class="dl-first">
        <summary>First launch on {OS_LABEL[best.os]}</summary>
        <p>{FIRST_LAUNCH[best.os]}</p>
      </details>
    {/if}
  {:else}
    <div class="dl-grid">
      {#each OTHERS as os (os)}
        {@const b = otherBest(os)}
        {#if b}
          <div class="dl-card">
            <span class="dl-card-os"><PlatformMark {os} size={20} />{OS_LABEL[os]}</span>
            <a class="btn-primary dl-btn sm" href={b.asset.url}>
              {os === "mac" ? (arch === "x64" ? "Intel" : "Apple Silicon") : "Download"}
            </a>
            <span class="dl-card-meta"
              >{sizeLabel(b.asset.size)} · {b.asset.name.split(".").pop()}</span
            >
            {#if os === "mac"}
              <button
                type="button"
                class="dl-flip"
                onclick={() => pickArch(arch === "x64" ? "arm64" : "x64")}
              >
                {arch === "x64" ? "Apple Silicon instead" : "Intel instead"}
              </button>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
    <p class="dl-hint">Mareader is a desktop app — grab the installer for your computer.</p>
  {/if}
  {#if variant === "full"}
    <p class="dl-all">
      <a href={tagUrl}>All files, other formats & checksums</a>
      {#if releases.live}<span class="dl-live" title="fetched live from GitHub"
          >updated just now</span
        >{/if}
    </p>
    <p class="dl-also" data-testid="dl-also">
      Also available: {#if assetOf(rel, "win-msi")}<a href={assetOf(rel, "win-msi")!.url}>MSI</a
        >{/if}
      {#if assetOf(rel, "linux-appimage")}
        · <a href={assetOf(rel, "linux-appimage")!.url}>AppImage</a>{/if}
      {#if assetOf(rel, "linux-arch")}
        · <a href={assetOf(rel, "linux-arch")!.url}>Arch tar.gz</a>{/if}
    </p>
  {/if}
</div>
