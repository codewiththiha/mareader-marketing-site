<script lang="ts">
  import { BookA, LibraryBig, PanelLeft, Palette, Search, Settings } from "@lucide/svelte";
  import { styles } from "@/lib/style";
  import { BAR_H } from "@/lib/window/tree";
  import IconButton from "@/lib/window/IconButton.svelte";
  import TrafficLights from "@/lib/window/TrafficLights.svelte";

  let {
    title,
    left = 0,
    lights = true,
    appearanceOpen = false,
    settingsOpen = false,
    sidebarOn = false,
  }: {
    title: string;
    left?: number;
    lights?: boolean;
    appearanceOpen?: boolean;
    settingsOpen?: boolean;
    sidebarOn?: boolean;
  } = $props();
</script>

<div
  class="geo absolute top-0 right-0 z-30 flex items-center"
  style={styles({
    left,
    height: BAR_H,
    background: "color-mix(in srgb, var(--surface) 59%, transparent)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid color-mix(in srgb, var(--line) 70%, transparent)",
    paddingLeft: 8,
    paddingRight: 8,
  })}
>
  {#if lights}
    <TrafficLights style="margin-left:12px;margin-right:16px" />
  {/if}
  <div class="flex items-center gap-1">
    <IconButton icon={PanelLeft} pressed={sidebarOn} label="Toggle sidebar" />
    <IconButton icon={LibraryBig} label="Library" />
  </div>
  <div
    class="pointer-events-none absolute inset-x-0 truncate text-center"
    style={styles({ fontSize: 13, fontWeight: 500, color: "var(--ink)", paddingInline: 200 })}
  >
    {title}
  </div>
  <div class="ml-auto flex items-center gap-1">
    <IconButton icon={Search} label="Search" />
    <IconButton icon={BookA} label="Dictionary" />
    <IconButton icon={Palette} pressed={appearanceOpen} focus="appearance-button" label="Appearance" />
    <IconButton icon={Settings} pressed={settingsOpen} label="Settings" />
  </div>
</div>
