<script lang="ts">
  // Header — top bar with theme toggle
  import { Moon, Sun } from "@lucide/svelte";
  import Logo from "./Logo.svelte";
  import { RELEASES } from "@/lib/constants";

  let { dark, onToggle }: { dark: boolean; onToggle: () => void } = $props();
</script>

<header class="fixed inset-x-0 top-0 z-50">
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-x-0 top-0 h-[64px]"
    style="background: linear-gradient(to bottom, rgba(var(--bg-rgb),0.94) 0%, rgba(var(--bg-rgb),0.7) 50%, rgba(var(--bg-rgb),0) 100%)"
  ></div>
  <div class="mx-auto flex h-14 max-w-[1240px] items-center justify-between px-5 sm:px-10">
    <a href="#top" class="flex items-center gap-2.5" aria-label="Mareader">
      <Logo size={28} />
      <span class="font-serif text-[19px] font-semibold tracking-[-0.01em]">Mareader</span>
    </a>
    <div class="flex items-center gap-2">
      <button
        onclick={onToggle}
        class="grid h-10 w-10 place-items-center rounded-full text-[var(--fg)] transition-colors hover:bg-[var(--hair)]"
        aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      >
        {#if dark}
          <Sun size={18} strokeWidth={1.75} />
        {:else}
          <Moon size={18} strokeWidth={1.75} />
        {/if}
      </button>
      <a
        href={RELEASES}
        class="hidden h-10 items-center rounded-full border border-[var(--hair)] px-4 text-[14px] font-medium transition-colors hover:bg-[var(--hair)] sm:inline-flex"
      >
        Download
      </a>
    </div>
  </div>
</header>
