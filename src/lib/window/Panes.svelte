<script lang="ts">
  import type { Snippet } from "svelte";
  import { cssVars, tokensOf, type Appearance, type Tokens } from "@/lib/palette";
  import { styles } from "@/lib/style";
  import { count, layout, type DropZone, type PaneSpec, type Rect, type Tree } from "@/lib/window/tree";
  import EpubPage from "@/lib/window/EpubPage.svelte";
  import EmptyPane from "@/lib/window/EmptyPane.svelte";
  import PdfPage from "@/lib/window/PdfPage.svelte";
  import TextureLayer from "@/lib/window/TextureLayer.svelte";

  let {
    tree,
    area,
    panes,
    windowLook,
    dropZone = null,
    pane,
  }: {
    tree: Tree;
    area: Rect;
    panes: PaneSpec[];
    windowLook: Appearance;
    dropZone?: DropZone | null;
    pane?: Snippet<[PaneSpec, Rect, Tokens]>;
  } = $props();

  const view = $derived(layout(tree, area));
  const split = $derived(count(tree) > 1);
</script>

{#each panes as p (p.id)}
  {@const r = view.rects.get(p.id)}
  {#if r}
    {@const look = p.look ?? windowLook}
    {@const tokens = tokensOf(look)}
    <div
      data-focus={`pane-${p.id}`}
      class="geo absolute overflow-hidden"
      style={styles({ left: r.x, top: r.y, width: r.w, height: r.h, background: "var(--page-paper)", ...(p.look ? cssVars(tokens) : {}) })}
    >
      {#if pane}
        {@render pane(p, r, tokens)}
      {:else if p.book}
        {#if p.book.format === "PDF"}
          <PdfPage width={r.w} {look} dark={tokens.dark} />
        {:else}
          <EpubPage book={p.book} width={r.w} />
        {/if}
      {:else}
        <EmptyPane />
      {/if}
      {#if p.book?.format !== "PDF"}
        <TextureLayer {look} dark={tokens.dark} />
      {/if}
      {#if dropZone?.pane === p.id}
        <div
          class="absolute"
          style={styles({
            ...(dropZone.side === "right"
              ? { top: 4, bottom: 4, right: 4, width: r.w / 2 - 6 }
              : { left: 4, right: 4, bottom: 4, height: r.h / 2 - 6 }),
            borderRadius: 10,
            background: "color-mix(in srgb, var(--accent) 14%, transparent)",
            boxShadow: "inset 0 0 0 2px var(--accent)",
            animation: "fade-in 0.25s ease both",
          })}
        ></div>
      {/if}
    </div>
  {/if}
{/each}
{#if split}
  {#each view.dividers as d, i (i)}
    <div
      class="geo pointer-events-none absolute"
      style={styles(
        d.axis === "h"
          ? { left: d.at - 0.5, top: d.parent.y, width: 1, height: d.parent.h, background: "var(--line)" }
          : { top: d.at - 0.5, left: d.parent.x, height: 1, width: d.parent.w, background: "var(--line)" },
      )}
    ></div>
  {/each}
{/if}
