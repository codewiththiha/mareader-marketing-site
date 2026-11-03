<script lang="ts">
  import GithubMark from "$lib/icons/GithubMark.svelte";
  import Icon from "$lib/icons/Icon.svelte";
  import { Moon, Sun } from "$lib/icons/nodes";
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
</script>

<header class="nav" class:solid>
  <a href="#top" class="flex items-center gap-2.5" aria-label="Mareader, back to top">
    <img src={icon} alt="" width={30} height={30} class="h-[30px] w-[30px] rounded-[8px]" />
    <span class="text-[16px] font-semibold tracking-[-0.01em]">Mareader</span>
  </a>
  <nav class="flex items-center gap-1.5">
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
      {#if theme.current === "dark"}
        <Icon node={Sun} size={18} strokeWidth={1.9} />
      {:else}
        <Icon node={Moon} size={18} strokeWidth={1.9} />
      {/if}
    </button>
    <a href="#download" class="btn btn-accent btn-sm ml-1.5">Download</a>
  </nav>
</header>
