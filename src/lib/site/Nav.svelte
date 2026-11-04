<script lang="ts">
  import Slide from "$lib/chrome/Slide.svelte";
  import GithubMark from "$lib/icons/GithubMark.svelte";
  import Download from "$lib/icons/lively/Download.svelte";
  import SunMoon from "$lib/icons/lively/SunMoon.svelte";
  import { OS_LABEL } from "$lib/site/downloads";
  import { router } from "$lib/site/router.svelte";
  import { theme } from "$lib/site/theme.svelte";
  import { platform } from "$lib/utils/platform.svelte";
  import { slideGroup } from "$lib/utils/slide.svelte";
  import icon from "../../assets/icon.png";

  const GH = "https://github.com/codewiththiha/mareader2";

  const group = slideGroup();
  const els: Record<string, HTMLElement | undefined> = {};
  const rest = () => {
    const cur = router.current;
    group.move(cur === "home" || cur === "download" ? null : (els[cur] ?? null));
  };
  $effect(() => {
    rest();
  });

  const goHome = (e: Event) => {
    e.preventDefault();
    router.go("home");
    window.scrollTo({ top: 0 });
  };

  const route = (key: "releases" | "donate", label: string) => ({ key, label });
  const links = [route("releases", "Releases"), route("donate", "Support")];
</script>

<header class="nav">
  <a href="#/" class="nav-brand" aria-label="Mareader, back to top" onclick={goHome}>
    <img src={icon} alt="" width={30} height={30} />
    <span class="max-sm:hidden">Mareader</span>
  </a>
  <div class="nav-side">
    <nav class="nav-routes" aria-label="Sections" onmouseleave={rest}>
      <Slide {group} radius={999} />
      {#each links as l (l.key)}
        <a
          href={router.href(l.key)}
          class="nav-link"
          bind:this={els[l.key]}
          aria-current={router.current === l.key ? "page" : undefined}
          onmouseenter={() => {
            group.move(els[l.key] ?? null);
          }}
          onfocus={() => {
            group.move(els[l.key] ?? null);
          }}>{l.label}</a
        >
      {/each}
    </nav>
    <a href={GH} class="icon-btn nav-gh" aria-label="Mareader on GitHub" rel="noopener noreferrer">
      <GithubMark />
    </a>
    <button
      type="button"
      class="icon-btn"
      onclick={() => {
        theme.toggle();
      }}
      aria-label={theme.current === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      <SunMoon dark={theme.current === "dark"} />
    </button>
    <a
      href={router.href("download")}
      class="btn btn-accent btn-sm nav-dl"
      aria-current={router.current === "download" ? "page" : undefined}
    >
      <Download />
      Download
      {#if platform.os !== "unknown"}<span class="dl-os">{OS_LABEL[platform.os]}</span>{/if}
    </a>
  </div>
</header>
