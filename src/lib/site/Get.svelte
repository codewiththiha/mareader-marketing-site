<script lang="ts">
  import Download from "$lib/icons/lively/Download.svelte";
  import { LATEST_TAG, OS_LABEL, releaseTagUrl } from "$lib/site/os";
  import { router } from "$lib/site/router.svelte";
  import { platform } from "$lib/utils/platform.svelte";
  import icon from "../../assets/icon.png";

  let tag = $state(LATEST_TAG);
  $effect(() => {
    const id = window.setTimeout(() => {
      void import("$lib/site/downloads").then((m) => {
        tag = m.latestTag;
      });
    }, 1200);
    return () => {
      window.clearTimeout(id);
    };
  });
</script>

<section id="download" class="below-fold mx-auto flex max-w-[760px] scroll-mt-16 flex-col items-center px-6 pb-28 pt-10 text-center">
  <img src={icon} alt="" width={84} height={84} loading="lazy" decoding="async" class="h-[84px] w-[84px]" />
  <h2 class="serif mt-7 text-[clamp(32px,4.4vw,54px)] font-[540] leading-[1.06] tracking-[-0.02em]">Free, open source, and yours.</h2>
  <p class="mt-4 max-w-[40ch] text-[17px] leading-[1.55] text-[var(--muted)]">
    No account, no subscription. Just your books, the way you like to read them.
  </p>
  <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
    <a href={router.href("download")} class="btn btn-accent">
      <Download />
      Download for {OS_LABEL[platform.os]}
    </a>
  </div>
  <p class="mt-5 text-[13.5px] text-[var(--muted)]">
    {tag} ·
    <a class="underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]" href={router.href("releases")}>what’s new →</a>
    ·
    <a
      class="underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]"
      href={releaseTagUrl(tag)}
      rel="noopener noreferrer">checksums</a
    >
  </p>
</section>
