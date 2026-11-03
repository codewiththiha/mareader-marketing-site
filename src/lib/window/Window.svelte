<script lang="ts">
  import type { Snippet } from "svelte";
  import { cssVars, tokensOf, type Appearance } from "@/lib/palette";
  import { styles } from "@/lib/style";
  import { SIDEBAR_W } from "@/lib/window/tree";
  import Grain from "@/lib/window/Grain.svelte";
  import Sidebar from "@/lib/window/Sidebar.svelte";
  import TitleBar from "@/lib/window/TitleBar.svelte";

  let {
    look,
    width,
    height,
    title,
    sidebar = false,
    dragging = null,
    appearanceOpen = false,
    settingsOpen = false,
    children,
  }: {
    look: Appearance;
    width: number;
    height: number;
    title: string;
    sidebar?: boolean;
    dragging?: string | null;
    appearanceOpen?: boolean;
    settingsOpen?: boolean;
    children?: Snippet;
  } = $props();

  const tokens = $derived(tokensOf(look));
  const left = $derived(sidebar ? SIDEBAR_W : 0);
</script>

<div
  class="mw relative overflow-hidden select-none"
  style={styles({
    width,
    height,
    background: "var(--paper)",
    color: "var(--ink)",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    borderRadius: 12,
    ...cssVars(tokens),
  })}
>
  {@render children?.()}
  <TitleBar {title} {left} lights={!sidebar} {appearanceOpen} {settingsOpen} sidebarOn={sidebar} />
  {#if sidebar}
    <Sidebar {dragging} />
  {/if}
  <Grain {look} dark={tokens.dark} />
</div>
