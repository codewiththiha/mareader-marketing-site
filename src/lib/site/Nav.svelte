<script lang="ts">
  import GithubMark from "$lib/icons/GithubMark.svelte";
  import SunMoon from "$lib/icons/lively/SunMoon.svelte";
  import { router } from "$lib/site/router.svelte";
  import { theme } from "$lib/site/theme.svelte";
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
    <span class="text-[16px] font-semibold tracking-[-0.01em]">Mareader</span>
  </a>
  <nav class="flex items-center gap-1.5">
    <a href={router.href("releases")} class="nav-link max-md:hidden" aria-current={router.current === "releases" ? "page" : undefined}
      >Releases</a
    >
    <a href={router.href("donate")} class="nav-link max-md:hidden" aria-current={router.current === "donate" ? "page" : undefined}
      >Support</a
    >
    <a href={GH} class="icon-btn" aria-label="Mareader on GitHub">
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
    <a href="#download" class="btn btn-accent btn-sm ml-1.5" onclick={toDownload}>Download</a>
  </nav>
</header>
