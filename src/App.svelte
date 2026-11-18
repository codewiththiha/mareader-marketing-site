<script lang="ts">
  import type { Component } from "svelte";
  import Film from "$lib/film/Film.svelte";
  import Details from "$lib/site/Details.svelte";
  import Footer from "$lib/site/Footer.svelte";
  import Get from "$lib/site/Get.svelte";
  import More from "$lib/site/More.svelte";
  import Nav from "$lib/site/Nav.svelte";
  import { router, type Route } from "$lib/site/router.svelte";
  import { theme } from "$lib/site/theme.svelte";
  import { perf } from "$lib/utils/perf.svelte";
  import { mountTextures } from "$lib/utils/textures";
  import favicon from "./assets/icon32.png";

  const isBake = /[?&](bake|bakelist)\b/.test(window.location.search);

  const loaders: Record<Exclude<Route, "home">, () => Promise<{ default: Component }>> = {
    releases: () => import("$lib/pages/ReleasesPage.svelte"),
    donate: () => import("$lib/pages/DonatePage.svelte"),
    download: () => import("$lib/pages/DownloadPage.svelte"),
  };

  let pages = $state<Partial<Record<Exclude<Route, "home">, Component>>>({});
  let BakeComp = $state<Component | null>(null);

  $effect(() => {
    if (!isBake) return;
    void import("./Bake.svelte").then((m) => {
      BakeComp = m.default;
    });
  });

  $effect(() => {
    const r = router.current;
    if (r === "home" || pages[r]) return;
    void loaders[r]().then((m) => {
      pages = { ...pages, [r]: m.default };
    });
  });

  $effect(() => {
    if (isBake) return;
    mountTextures();
    if (perf.lite) return;
    const warm = window.setTimeout(() => {
      void loaders.download().then((m) => {
        pages = { ...pages, download: m.default };
      });
    }, 1800);
    return () => {
      window.clearTimeout(warm);
    };
  });

  $effect(() => {
    document.documentElement.dataset.theme = theme.current;
    try {
      localStorage.setItem("mr-site", theme.current);
    } catch {
      /* storage may be blocked */
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.current === "dark" ? "#12100e" : "#f6f1e8");
  });

  $effect(() => {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = favicon;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  });
</script>

{#if isBake}
  {#if BakeComp}<BakeComp />{/if}
{:else}
  <Nav />
  {#key router.current}
    {#if router.current === "home"}
      <main id="top">
        <Film site={theme.current} />
        <Details />
        <Get />
        <More />
      </main>
    {:else}
      {@const Page = pages[router.current]}
      <main id="top" class="min-h-[70svh]">
        {#if Page}<Page />{/if}
      </main>
    {/if}
  {/key}
  <Footer />
{/if}
