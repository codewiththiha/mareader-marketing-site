<script lang="ts">
  import Icon from "$lib/icons/Icon.svelte";
  import { BookA, LibraryBig, Menu, Minus, Palette, PanelLeft, Search, Square, X } from "$lib/icons/nodes";

  let { shown, title, lit }: { shown: boolean; title: string; lit: string | null } = $props();

  const BTNS: { x: number; node: typeof PanelLeft; id?: string }[] = [
    { x: 34, node: PanelLeft },
    { x: 88, node: LibraryBig },
    { x: 142, node: BookA },
    { x: 1270, node: Search },
    { x: 1324, node: Palette, id: "palette" },
    { x: 1378, node: Menu },
  ];
  const CTLS = [Minus, Square, X];
</script>

<div class="tb" class:on={shown}>
  {#each BTNS as b (b.x)}
    <div class="tb-btn spot" class:lit={b.id !== undefined && lit === b.id} style:left="{b.x - 20}px">
      <Icon node={b.node} ariaHidden />
    </div>
  {/each}
  <div class="tb-title">{title}</div>
  {#each CTLS as node, i (i)}
    <div class="tb-ctl" style:left="{1415 + i * 41}px">
      <Icon {node} size={i === 1 ? 11 : 13} strokeWidth={2} ariaHidden />
    </div>
  {/each}
</div>
