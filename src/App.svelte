<script lang="ts">
  // App — routes, theme and the page frame
  import Header from "@/lib/components/Header.svelte";
  import Footer from "@/lib/components/Footer.svelte";
  import Home from "@/lib/sections/Home.svelte";
  import Releases from "@/lib/sections/Releases.svelte";
  import Support from "@/lib/sections/Support.svelte";
  import { router, type Route } from "@/lib/router.svelte";
  import { useTheme, applyThemeClass } from "@/lib/stores/theme.svelte";
  import { platform } from "@/lib/platform.svelte";
  import { support } from "@/lib/support/geo.svelte";
  import { releases } from "@/lib/releases/refresh.svelte";
  import { onMount } from "svelte";

  const theme = useTheme();
  let dark = $state(false);
  let route = $derived(router.route);
  let dir = $derived(router.direction);

  const TITLES: Record<Route, string> = {
    home: "Mareader — a calm PDF and EPUB reader",
    releases: "Release notes — Mareader",
    support: "Support — Mareader"
  };

  onMount(() => {
    theme.init();
    dark = theme.dark;
    applyThemeClass(dark);
    platform.init();
    support.init();
    void releases.refresh();
  });

  $effect(() => {
    dark = theme.dark;
    applyThemeClass(dark);
    document.title = TITLES[route];
  });

  $effect(() => {
    void route;
    window.scrollTo(0, 0);
  });

  function toggle() {
    theme.toggle();
    dark = theme.dark;
  }
</script>

<div class="min-h-screen">
  <Header {dark} onToggle={toggle} />
  <main id="top">
    {#key route}
      <div class="page" data-dir={dir}>
        {#if route === "releases"}
          <Releases />
        {:else if route === "support"}
          <Support />
        {:else}
          <Home />
        {/if}
      </div>
    {/key}
  </main>
  <Footer />
</div>
