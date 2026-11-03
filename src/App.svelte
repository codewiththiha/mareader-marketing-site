<script lang="ts">
  import Bake from "./Bake.svelte";
  import Film from "$lib/film/Film.svelte";
  import Details from "$lib/site/Details.svelte";
  import Footer from "$lib/site/Footer.svelte";
  import Get from "$lib/site/Get.svelte";
  import Nav from "$lib/site/Nav.svelte";
  import { theme } from "$lib/site/theme.svelte";
  import favicon from "./assets/icon32.png";

  const isBake = /[?&](bake|bakelist)\b/.test(window.location.search);

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
  <Bake />
{:else}
  <Nav />
  <main id="top">
    <Film site={theme.current} />
    <Details />
    <Get />
  </main>
  <Footer />
{/if}
