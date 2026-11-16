<script lang="ts">
  // Keep the preferred Mac chip for the direct download on subsequent visits.
  import { ArrowRight, Download } from "@lucide/svelte";
  import { platform } from "@/lib/platform.svelte";
  import { sizeLabel } from "@/lib/releases/assets";
  import { bestFor, OS_LABEL } from "@/lib/downloads";
  import { href } from "@/lib/router.svelte";
  import PlatformMark from "./icons/PlatformMark.svelte";
  import Pill from "./Pill.svelte";
  import type { OS } from "@/lib/platform";

  let { variant = "full" }: { variant?: "full" | "compact" } = $props();

  let arch = $derived(platform.macArch);
  let best = $derived(
    platform.mobile ? null : bestFor(platform.os, platform.os === "mac" ? arch : platform.arch)
  );
  const OTHERS = ["mac", "windows", "linux"] as const;

  function pickArch(a: "arm64" | "x64") {
    platform.setMacArch(a);
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
  {:else if variant === "compact"}
    <div class="dl-grid">
      {#each OTHERS as os (os)}
        {@const b = otherBest(os)}
        {#if b}
          <div class="dl-card">
            <span class="dl-card-os"><PlatformMark {os} size={20} />{OS_LABEL[os]}</span>
            <a class="btn-primary dl-btn sm" href={b.asset.url}>
              {os === "mac" ? (arch === "x64" ? "Intel" : "Apple Silicon") : "Download"}
            </a>
            <span class="dl-card-meta">
              {sizeLabel(b.asset.size)} · {b.asset.name.split(".").pop()}
            </span>
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
    <p class="dl-hint">Mareader is a desktop app — choose the installer for your computer.</p>
  {:else}
    <div class="dl-primary">
      <a class="btn-primary dl-btn" href={href("downloads")} data-testid="dl-choose">
        <Download size={18} />
        Choose your download
      </a>
      <p class="dl-meta">Available for macOS, Windows and Linux.</p>
    </div>
  {/if}
  {#if variant === "full" && best}
    <a class="dl-browse" href={href("downloads")}>All downloads <ArrowRight size={16} /></a>
  {/if}
</div>
