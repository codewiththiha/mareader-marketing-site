<script lang="ts">
  import Reel from "$lib/reel/Reel.svelte";
  import Details from "$lib/site/Details.svelte";
  import DonatePage from "$lib/pages/DonatePage.svelte";
  import DownloadPage from "$lib/pages/DownloadPage.svelte";
  import Footer from "$lib/site/Footer.svelte";
  import Get from "$lib/site/Get.svelte";
  import More from "$lib/site/More.svelte";
  import Nav from "$lib/site/Nav.svelte";
  import ReleasesPage from "$lib/pages/ReleasesPage.svelte";
  import { router } from "$lib/site/router.svelte";
  import { theme } from "$lib/site/theme.svelte";
  import favicon from "./assets/icon32.png";

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

<Nav />
{#key router.current}
  {#if router.current === "releases"}
    <main id="top"><ReleasesPage /></main>
  {:else if router.current === "donate"}
    <main id="top"><DonatePage /></main>
  {:else if router.current === "download"}
    <main id="top"><DownloadPage /></main>
  {:else}
    <main id="top">
      <Reel site={theme.current} />
      <Details />
      <Get />
      <More />
    </main>
  {/if}
{/key}
<Footer />
