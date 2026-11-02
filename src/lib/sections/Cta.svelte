<script lang="ts">
  // Cta — installers card
  import { Download } from "@lucide/svelte";
  import { RELEASES } from "@/lib/constants";
  import { reveal } from "@/lib/actions/reveal.svelte";
  const PLATFORMS = ["macOS", "Windows", "Linux"];
</script>

<div use:reveal class="reveal mt-20 rounded-[28px] border border-[var(--hair)] px-6 py-12 text-center sm:mt-28 sm:py-16">
  <h3 class="font-serif text-[28px] font-medium tracking-[-0.015em] sm:text-[38px]">Pick up where you left off.</h3>
  <p class="mx-auto mt-3 max-w-[440px] text-[15.5px] leading-[1.6] text-[var(--fg2)]">Installers for every system are on the releases page.</p>
  <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
    {#each PLATFORMS as p, i}
      <a href={RELEASES} class={i === 0 ? "btn-primary" : "btn-ghost"}>
        {#if i === 0}<Download size={17} strokeWidth={2} />{/if}
        {p}
      </a>
    {/each}
  </div>
</div>
