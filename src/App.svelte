<script lang="ts">
  import Film from "$lib/film/Film.svelte";
  import Details from "$lib/site/Details.svelte";
  import Footer from "$lib/site/Footer.svelte";
  import Get from "$lib/site/Get.svelte";
  import More from "$lib/site/More.svelte";
  import Nav from "$lib/site/Nav.svelte";
  import { router } from "$lib/site/router.svelte";
  import { theme } from "$lib/site/theme.svelte";
  import favicon from "./assets/icon32.png";

  const isBake = /[?&](bake|bakelist)\b/.test(window.location.search);
  const routes = {
    releases: () => import("$lib/pages/ReleasesPage.svelte"),
    donate: () => import("$lib/pages/DonatePage.svelte"),
    download: () => import("$lib/pages/DownloadPage.svelte"),
  };

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
  {#await import("./Bake.svelte") then { default: Bake }}
    <Bake />
  {/await}
{:else}
  <Nav />
  {#key router.current}
    {#if router.current !== "home"}
      <main id="top">
        {#await routes[router.current]()}
          <p class="route-load" role="status">Opening…</p>
        {:then { default: Page }}
          <Page />
        {:catch}
          <p class="route-load" role="alert">This page couldn’t load. <a href="#/">Back to Mareader</a></p>
        {/await}
      </main>
    {:else}
      <main id="top">
        <Film site={theme.current} />
        <Details />
        <Get />
        <More />
      </main>
    {/if}
  {/key}
  <Footer />
{/if}
