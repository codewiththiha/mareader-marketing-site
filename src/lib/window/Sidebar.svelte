<script lang="ts">
  import { LayoutGrid, LibraryBig, ListTree, StickyNote } from "@lucide/svelte";
  import { BOOKS } from "@/lib/content";
  import { styles } from "@/lib/style";
  import { BAR_H, SIDEBAR_W } from "@/lib/window/tree";
  import Cover from "@/lib/window/Cover.svelte";
  import IconButton from "@/lib/window/IconButton.svelte";
  import TrafficLights from "@/lib/window/TrafficLights.svelte";

  let { dragging = null, width = SIDEBAR_W }: { dragging?: string | null; width?: number } = $props();
</script>

<div
  class="absolute inset-y-0 left-0 z-20 flex flex-col"
  style={styles({ width, background: "var(--surface)", borderRight: "1px solid var(--line)" })}
>
  <div class="flex items-center" style={styles({ height: BAR_H, paddingLeft: 20, paddingRight: 8 })}>
    <TrafficLights />
    <div class="ml-auto flex items-center gap-1">
      <IconButton icon={LayoutGrid} size={32} iconSize={16} />
      <IconButton icon={ListTree} size={32} iconSize={16} />
      <IconButton icon={LibraryBig} size={32} iconSize={16} pressed />
      <IconButton icon={StickyNote} size={32} iconSize={16} />
    </div>
  </div>
  <div
    class="flex items-center justify-between"
    style={styles({ padding: "6px 16px 4px", fontSize: 12, fontWeight: 500, color: "var(--muted)" })}
  >
    <span>Library</span>
    <span style={styles({ fontWeight: 400 })}>{BOOKS.length} books</span>
  </div>
  <div class="flex flex-col" style={styles({ padding: "2px 8px" })}>
    {#each BOOKS as b (b.id)}
      <div
        data-focus={`lib-${b.id}`}
        class="flex items-center gap-3"
        style={styles({
          height: 46,
          padding: "0 8px",
          borderRadius: 8,
          opacity: dragging === b.id ? 0.35 : 1,
          background: dragging === b.id ? "var(--hover)" : "transparent",
        })}
      >
        <Cover book={b} width={22} />
        <div class="min-w-0 flex-1">
          <div class="truncate" style={styles({ fontSize: 13, color: "var(--ink)" })}>{b.short}</div>
          <div class="truncate" style={styles({ fontSize: 11, color: "var(--muted)" })}>{b.author} · {b.format}</div>
        </div>
      </div>
    {/each}
  </div>
</div>
