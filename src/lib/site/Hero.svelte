<script lang="ts">
  import { ArrowUpRight, Download } from "@lucide/svelte";
  import { RELEASES, REPO } from "@/lib/site/links";
  import HeroWindow from "@/lib/site/HeroWindow.svelte";
  import { osName } from "@/lib/site/os";

  const os = osName();
</script>

<section id="top" class="mx-auto max-w-6xl px-5 pt-16 pb-10 sm:px-8 sm:pt-24">
  <div class="max-w-3xl">
    <h1 class="font-serif text-[40px] leading-[1.06] font-medium tracking-[-0.015em] text-balance sm:text-[60px]">
      A calm reader for PDF and EPUB.
    </h1>
    <p class="mt-6 max-w-[56ch] text-[17px] leading-[1.55] text-muted sm:text-[19px]">
      Native, in Rust. No webview, no JavaScript, a fraction of the memory. Your look on every page, four books at once, your own AI, and
      voices that never leave your computer.
    </p>
    <div class="mt-8 flex flex-wrap items-center gap-3">
      <a
        href={RELEASES}
        target="_blank"
        rel="noreferrer"
        class="inline-flex h-11 items-center gap-2 rounded-[10px] bg-ink px-5 text-[15px] font-medium text-paper transition-opacity hover:opacity-90"
      >
        <Download size={16} /> Download for {os}
      </a>
      <a
        href={REPO}
        target="_blank"
        rel="noreferrer"
        class="inline-flex h-11 items-center gap-1.5 rounded-[10px] border border-line px-4 text-[15px] text-ink transition-colors hover:bg-line/50"
      >
        View on GitHub <ArrowUpRight size={15} class="text-muted" />
      </a>
      <span class="text-[13px] text-muted">v0.0.5 · macOS, Windows, Linux · MIT</span>
    </div>
  </div>
  <div class="mt-14 sm:mt-20">
    <HeroWindow />
  </div>
</section>
