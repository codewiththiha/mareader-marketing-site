<script lang="ts">
  import Icon from "$lib/icons/Icon.svelte";
  import { Gear, LayoutGrid, LibraryBig, ListTree, PanelLeftClose, Pin, Search, StickyNote, type IconNode } from "$lib/icons/nodes";
  import MiniPage from "./MiniPage.svelte";
  import type { Mini } from "./minipage";

  let { open }: { open: boolean } = $props();

  const THUMBS: Mini[] = ["title", "toc", "text", "chapter", "text", "chapter", "text", "text"];
  const TABS: { name: string; node: IconNode }[] = [
    { name: "Thumbnails", node: LayoutGrid },
    { name: "Outline", node: ListTree },
    { name: "Notes", node: StickyNote },
    { name: "Library", node: LibraryBig },
  ];
  const ICONS: { left: number; node: IconNode; accent?: boolean }[] = [
    { left: 14, node: PanelLeftClose },
    { left: 68, node: Search },
    { left: 121, node: Gear },
    { left: 314, node: Pin, accent: true },
  ];
</script>

<aside class="sb" class:on={open}>
  {#each ICONS as ic (ic.left)}
    <div class="sb-i" style:left="{ic.left}px" style:color={ic.accent ? "var(--a)" : undefined}>
      <Icon node={ic.node} ariaHidden />
    </div>
  {/each}
  {#each THUMBS as k, i (i)}
    {@const x = i % 2 ? 191 : 23}
    {@const y = 77 + Math.floor(i / 2) * 237}
    <div>
      <div class="sb-th" class:sel={i === 1} style:left="{x}px" style:top="{y}px">
        <MiniPage kind={k} seed={i * 17} />
      </div>
      <div class="sb-n" class:sel={i === 1} style:left="{x}px" style:top="{y + 205}px">{i + 1}</div>
    </div>
  {/each}
  <div class="sb-tabs">
    {#each TABS as tab, i (tab.name)}
      <div class="sb-tab" class:sel={i === 0}>
        <Icon node={tab.node} size={20} strokeWidth={1.8} ariaHidden />
        <span>{tab.name}</span>
      </div>
    {/each}
  </div>
</aside>
