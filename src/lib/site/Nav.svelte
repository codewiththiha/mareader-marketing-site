<script lang="ts">
  import Slide from "$lib/chrome/Slide.svelte";
  import GithubMark from "$lib/icons/GithubMark.svelte";
  import SunMoon from "$lib/icons/lively/SunMoon.svelte";
  import { router } from "$lib/site/router.svelte";
  import { theme } from "$lib/site/theme.svelte";
  import { slideGroup } from "$lib/utils/slide.svelte";
  import icon from "../../assets/icon.png";

  let solid = $state(false);
  $effect(() => {
    const on = () => {
      solid = window.scrollY > 8;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
    };
  });

  const GH = "https://github.com/codewiththiha/mareader2";

  const group = slideGroup();
  const els: Record<string, HTMLElement | undefined> = {};
  const rest = () => {
    const cur = router.current;
    group.move(cur === "home" ? null : (els[cur] ?? null));
  };
  $effect(() => {
    rest();
  });

  const goHome = (e: Event) => {
    e.preventDefault();
    router.go("home");
    window.scrollTo({ top: 0 });
  };

  const toDownload = (e: Event) => {
    if (router.current !== "home") {
      e.preventDefault();
      router.go("home");
      window.setTimeout(() => document.getElementById("download")?.scrollIntoView(), 60);
    }
  };
</script>

<header class="nav" class:solid>
  <a href="#/" class="flex items-center gap-2.5" aria-label="Mareader, back to top" onclick={goHome}>
    <img src={icon} alt="" width={30} height={30} class="h-[30px] w-[30px] rounded-[8px]" />
    <span class="text-[16px] font-semibold tracking-[-0.01em] max-sm:hidden">Mareader</span>
  </a>
  <div class="flex items-center gap-1">
    <nav class="relative flex items-center gap-0.5" aria-label="Sections" onmouseleave={rest}>
      <Slide {group} />
      <a
        href={router.href("releases")}
        class="nav-link"
        bind:this={els.releases}
        aria-current={router.current === "releases" ? "page" : undefined}
        onmouseenter={() => {
          group.move(els.releases ?? null);
        }}
        onfocus={() => {
          group.move(els.releases ?? null);
        }}>Releases</a
      >
      <a
        href={router.href("donate")}
        class="nav-link"
        bind:this={els.donate}
        aria-current={router.current === "donate" ? "page" : undefined}
        onmouseenter={() => {
          group.move(els.donate ?? null);
        }}
        onfocus={() => {
          group.move(els.donate ?? null);
        }}>Support</a
      >
    </nav>
    <a href={GH} class="nav-gh icon-btn ml-1" aria-label="Mareader on GitHub">
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
    <a href="#download" class="btn btn-accent btn-sm ml-1" onclick={toDownload}>Download</a>
  </div>
</header>
