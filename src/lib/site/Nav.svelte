<script lang="ts">
  import Slide from "$lib/chrome/Slide.svelte";
  import Icon from "$lib/icons/Icon.svelte";
  import { Menu, X } from "$lib/icons/nodes";
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

  let menuOpen = $state(false);
  let header: HTMLElement;
  let menuButton: HTMLButtonElement;
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && menuOpen) {
      menuOpen = false;
      menuButton.focus();
    }
  };
  const onWindowClick = (event: MouseEvent) => {
    if (menuOpen && event.target instanceof Node && !header.contains(event.target)) menuOpen = false;
  };

  const group = slideGroup();
  const els: Record<string, HTMLElement | undefined> = {};
  const rest = () => {
    group.move(els[router.current] ?? null);
  };
  $effect(() => {
    rest();
  });

  const goHome = (e: Event) => {
    e.preventDefault();
    menuOpen = false;
    router.go("home");
    window.scrollTo({ top: 0 });
  };

  const route = (key: "home" | "releases" | "donate", label: string) => ({ key, label });
  const links = [route("home", "Home"), route("releases", "Releases"), route("donate", "Support")];
</script>

<svelte:window
  onkeydown={onKeydown}
  onclick={onWindowClick}
  onhashchange={() => {
    menuOpen = false;
  }}
/>

<header class="nav" bind:this={header}>
  <a href="#/" class="nav-brand" aria-label="Mareader, back to top" onclick={goHome}>
    <img src={icon} alt="" width={30} height={30} />
    <span class="nav-brand-name">Mareader</span>
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
      aria-label="Download Mareader"
      aria-current={router.current === "download" ? "page" : undefined}
    >
      <Download />
      <span class="nav-dl-label">Download</span>
      {#if platform.os !== "unknown"}<span class="dl-os">{OS_LABEL[platform.os]}</span>{/if}
    </a>
    <button
      type="button"
      class="icon-btn nav-menu-toggle"
      bind:this={menuButton}
      aria-label={menuOpen ? "Close menu" : "Open menu"}
      aria-expanded={menuOpen}
      aria-controls="mobile-menu"
      onclick={() => {
        menuOpen = !menuOpen;
      }}
    >
      <Icon node={menuOpen ? X : Menu} size={20} ariaHidden />
    </button>
  </div>
  <nav id="mobile-menu" class="nav-mobile-menu" aria-label="Mobile sections" hidden={!menuOpen}>
    {#each links as l (l.key)}
      <a
        href={router.href(l.key)}
        aria-current={router.current === l.key ? "page" : undefined}
        onclick={() => {
          menuOpen = false;
        }}
      >
        <span>{l.label}</span><span aria-hidden="true">↗</span>
      </a>
    {/each}
    <a
      href={GH}
      rel="noopener noreferrer"
      onclick={() => {
        menuOpen = false;
      }}><span>GitHub</span><span aria-hidden="true">↗</span></a
    >
  </nav>
</header>
