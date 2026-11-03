<script lang="ts">
  // Header — nav pill, theme toggle and the platform download
  import Logo from "./Logo.svelte";
  import Pill from "./Pill.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";
  import PlatformMark from "./icons/PlatformMark.svelte";
  import { House, ScrollText, Heart } from "@lucide/svelte";
  import { router, href, type Route } from "@/lib/router.svelte";
  import { platform } from "@/lib/platform.svelte";
  import { bestFor } from "@/lib/downloads";

  let { dark, onToggle }: { dark: boolean; onToggle: () => void } = $props();

  const NAV = [
    { id: "home", label: "Home", icon: House, href: href("home"), title: "Home" },
    {
      id: "releases",
      label: "Releases",
      icon: ScrollText,
      href: href("releases"),
      title: "Release notes"
    },
    {
      id: "support",
      label: "Support",
      icon: Heart,
      href: href("support"),
      title: "Support Mareader"
    }
  ];

  let route = $derived(router.route);
  let best = $derived(platform.mobile ? null : bestFor(platform.os, platform.arch));
</script>

<header class="hdr">
  <div
    aria-hidden="true"
    class="hdr-wash"
    style="background: linear-gradient(to bottom, rgba(var(--bg-rgb),0.94) 0%, rgba(var(--bg-rgb),0.7) 50%, rgba(var(--bg-rgb),0) 100%)"
  ></div>
  <div class="hdr-in">
    <a href={href("home")} class="hdr-brand" aria-label="Mareader — home">
      <Logo size={28} />
      <span class="hdr-word">Mareader</span>
    </a>
    <div class="hdr-right">
      <Pill
        bare
        mode="nav"
        items={NAV}
        active={route}
        onSelect={(id) => router.go(id as Route)}
        ariaLabel="Sections"
      />
      <ThemeToggle {dark} {onToggle} />
      {#if best}
        <a href={best.asset.url} class="hdr-dl" title={best.meta} data-testid="hdr-dl">
          <PlatformMark os={best.os} size={15} />
          <span>Download</span>
        </a>
      {:else}
        <a href={href("releases")} class="hdr-dl" data-testid="hdr-dl">
          <span>Download</span>
        </a>
      {/if}
    </div>
  </div>
</header>
