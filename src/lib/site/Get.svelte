<script lang="ts">
  import Download from "$lib/icons/lively/Download.svelte";
  import { latestTag, OS_LABEL, releaseUrl } from "$lib/site/downloads";
  import { router } from "$lib/site/router.svelte";
  import { platform } from "$lib/utils/platform.svelte";
  import icon from "../../assets/icon.png";
</script>

<section id="download" class="mx-auto flex max-w-[760px] scroll-mt-16 flex-col items-center px-6 pb-28 pt-10 text-center">
  <img src={icon} alt="" width={84} height={84} class="h-[84px] w-[84px]" />
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
    {latestTag} ·
    <a class="underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]" href={router.href("releases")}>what’s new →</a>
    ·
    <a class="underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]" href={releaseUrl()} rel="noopener noreferrer"
      >checksums</a
    >
  </p>
</section>
