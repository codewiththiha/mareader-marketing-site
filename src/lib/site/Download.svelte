<script lang="ts">
  import { ArrowUpRight, Download } from "@lucide/svelte";
  import { RELEASES, REPO } from "@/lib/site/links";

  const BUILDS = [
    { name: "macOS 11+", detail: "Apple silicon and Intel, .dmg" },
    { name: "Windows 10 / 11", detail: "Setup .exe, or .msi for managed machines" },
    { name: "Linux", detail: ".deb, AppImage, or PKGBUILD for Arch" },
  ];
</script>

<section id="download" class="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
  <div class="rounded-[20px] border border-line bg-surface/60 p-7 sm:p-12">
    <div class="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <h2 class="font-serif text-[30px] leading-[1.12] font-medium tracking-[-0.01em] sm:text-[40px]">Free, open source, yours.</h2>
        <p class="mt-4 max-w-[48ch] text-[16px] leading-[1.55] text-muted sm:text-[18px]">
          Version 0.0.5. Installing over an older version keeps your library, settings and highlights. Your books stay on this computer.
        </p>
        <div class="mt-7 flex flex-wrap gap-3">
          <a
            href={RELEASES}
            target="_blank"
            rel="noreferrer"
            class="inline-flex h-11 items-center gap-2 rounded-[10px] bg-ink px-5 text-[15px] font-medium text-paper transition-opacity hover:opacity-90"
          >
            <Download size={16} /> Releases
          </a>
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            class="inline-flex h-11 items-center gap-1.5 rounded-[10px] border border-line px-4 text-[15px] text-ink transition-colors hover:bg-line/50"
          >
            Source <ArrowUpRight size={15} class="text-muted" />
          </a>
        </div>
      </div>
      <ul class="divide-y divide-line self-center">
        {#each BUILDS as build (build.name)}
          <li class="flex items-baseline justify-between gap-4 py-3.5">
            <span class="text-[15px] font-medium">{build.name}</span>
            <span class="text-right text-[13px] text-muted">{build.detail}</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</section>
