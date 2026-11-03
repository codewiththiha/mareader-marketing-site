<script lang="ts">
  import { Moon, Sun } from "@lucide/svelte";
  import GitHubMark from "@/lib/site/GitHubMark.svelte";
  import { REPO } from "@/lib/site/links";
  import Wordmark from "@/lib/site/Wordmark.svelte";
  import { theme } from "@/lib/theme.svelte";

  const LINKS = [
    { label: "Themes", href: "#themes" },
    { label: "Panes", href: "#panes" },
    { label: "AI", href: "#ai" },
    { label: "Read aloud", href: "#read-aloud" },
    { label: "Download", href: "#download" },
  ];
</script>

<header class="sticky top-0 z-50 border-b border-line/70 bg-paper/75 backdrop-blur-xl">
  <div class="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5 sm:px-8">
    <Wordmark />
    <nav class="ml-auto hidden items-center gap-6 text-[14px] text-muted md:flex">
      {#each LINKS as link (link.href)}
        <a href={link.href} class="transition-colors hover:text-ink">{link.label}</a>
      {/each}
    </nav>
    <div class="ml-auto flex items-center gap-1 md:ml-0">
      <button
        type="button"
        onclick={() => {
          theme.toggle();
        }}
        aria-label={theme.dark ? "Switch to light" : "Switch to dark"}
        class="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-line/60"
      >
        {#if theme.dark}
          <Sun size={17} />
        {:else}
          <Moon size={17} />
        {/if}
      </button>
      <a
        href={REPO}
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub"
        class="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-line/60"
      >
        <GitHubMark />
      </a>
    </div>
  </div>
</header>
