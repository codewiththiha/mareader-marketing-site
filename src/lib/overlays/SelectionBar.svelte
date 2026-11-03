<script lang="ts">
  import { BookSearch, Copy, Highlighter, StickyNote, Underline, Volume2 } from "@lucide/svelte";
  import { styles } from "@/lib/style";
  import AiMark from "@/lib/overlays/AiMark.svelte";
  import IconButton from "@/lib/window/IconButton.svelte";

  let { x, y, pressed = null }: { x: number; y: number; pressed?: "ai" | null } = $props();
</script>

<div
  data-focus="selection-bar"
  class="absolute z-40 flex items-center"
  style={styles({
    left: x,
    top: y,
    transform: "translateX(-50%)",
    padding: 3,
    gap: 1,
    borderRadius: 10,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    boxShadow: "0 6px 18px var(--shadow)",
    animation: "rise-in 0.18s var(--ease-out-quint) both",
  })}
>
  <span><IconButton icon={Copy} size={32} iconSize={16} /></span>
  <span>
    <div
      class="flex items-center justify-center"
      style={styles({
        width: 32,
        height: 32,
        borderRadius: 8,
        background: pressed === "ai" ? "var(--accent-soft)" : "transparent",
        color: pressed === "ai" ? "var(--accent)" : "var(--ink)",
      })}
    >
      <AiMark size={16} />
    </div>
  </span>
  <span><IconButton icon={BookSearch} size={32} iconSize={16} /></span>
  <span><IconButton icon={Highlighter} size={32} iconSize={16} /></span>
  <span><IconButton icon={Underline} size={32} iconSize={16} /></span>
  <span><IconButton icon={Volume2} size={32} iconSize={16} /></span>
  <span><IconButton icon={StickyNote} size={32} iconSize={16} /></span>
</div>
