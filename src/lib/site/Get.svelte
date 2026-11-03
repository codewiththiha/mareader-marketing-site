<script lang="ts">
  import Download from "$lib/icons/lively/Download.svelte";
  import Slide from "$lib/chrome/Slide.svelte";
  import { latestTag, OS_LABEL, picksFor, releaseUrl, type Os, type Pick } from "$lib/site/downloads";
  import { router } from "$lib/site/router.svelte";
  import { platform } from "$lib/utils/platform.svelte";
  import { slideGroup } from "$lib/utils/slide.svelte";
  import icon from "../../assets/icon.png";

  const group = slideGroup();
  const els: Record<string, HTMLElement> = {};

  const own = $derived(picksFor(platform.os));
  const primary = $derived(platform.os === "mac" && !platform.arm ? (own[1] ?? own[0]) : own[0]);
  const chips = $derived(() => {
    const rest = own.filter((p) => p.id !== primary.id).map((p) => ({ ...p, os: OS_LABEL[platform.os] }));
    const others = (["mac", "windows", "linux"] as Os[])
      .filter((o) => o !== platform.os)
      .map((o) => ({ ...picksFor(o)[0], os: OS_LABEL[o] }));
    return [...rest, ...others];
  });
  let held = $state<Pick | null>(null);
  const rest = () => {
    group.move(els[held?.id ?? primary.id]);
  };
</script>

<section id="download" class="mx-auto flex max-w-[760px] scroll-mt-16 flex-col items-center px-6 pb-28 pt-10 text-center">
  <img src={icon} alt="" width={84} height={84} class="h-[84px] w-[84px]" />
  <h2 class="serif mt-7 text-[clamp(32px,4.4vw,54px)] font-[540] leading-[1.06] tracking-[-0.02em]">Free, open source, and yours.</h2>
  <p class="mt-4 max-w-[40ch] text-[17px] leading-[1.55] text-[var(--muted)]">
    No account, no subscription. Just your books, the way you like to read them.
  </p>
  <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
    <a href={primary.url} class="btn btn-accent" onclick={() => (held = primary)}>
      <Download />
      Download for {OS_LABEL[platform.os]}
    </a>
  </div>
  <div role="group" aria-label="Other platforms" class="dl-alts mt-3 flex flex-wrap justify-center gap-1.5" onmouseleave={rest}>
    <Slide {group} />
    {#each chips() as c (c.id)}
      <a
        href={c.url}
        class="dl-chip"
        bind:this={els[c.id]}
        onmouseenter={() => {
          group.move(els[c.id]);
        }}
        onfocus={() => {
          group.move(els[c.id]);
        }}
        onclick={() => (held = c)}
      >
        {c.os} · {c.label}
        <small>{c.sub}</small>
      </a>
    {/each}
  </div>
  <p class="mt-5 text-[13.5px] text-[var(--muted)]">
    {latestTag} ·
    <a class="underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]" href={router.href("releases")}>what’s new →</a>
    ·
    <a class="underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]" href={releaseUrl()} rel="noopener noreferrer"
      >checksums</a
    >
  </p>
  {#if platform.os === "mac"}
    <p class="mt-4 max-w-[52ch] text-[13px] leading-[1.6] text-[var(--muted)]">
      The macOS build isn’t notarized yet. If macOS stops it, choose Open Anyway in System Settings › Privacy &amp; Security.
    </p>
  {/if}
</section>

<style>
  .dl-alts {
    position: relative;
    padding: 4px;
  }
  .dl-chip {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    padding: 7px 12px;
    border-radius: 10px;
    font-size: 13px;
    color: var(--muted);
    transition: color 0.2s ease;
  }
  .dl-chip small {
    font-size: 11.5px;
    opacity: 0.8;
  }
  .dl-chip:hover {
    color: var(--ink);
  }
</style>
