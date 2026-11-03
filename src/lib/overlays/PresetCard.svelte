<script lang="ts">
  import { hex, tokensOf, type Appearance } from "@/lib/palette";
  import { styles } from "@/lib/style";

  let {
    id,
    name,
    look,
    selected,
    pressed = false,
  }: { id: string; name: string; look: Appearance; selected: boolean; pressed?: boolean } = $props();

  const tokens = $derived(tokensOf(look));
  const paper = $derived(hex(tokens.pagePaper));
  const ink = $derived(hex(tokens.pageInk));
  const LINES = [1, 0.85, 0.95, 0.6];
</script>

<div data-focus={`preset-${id}`} class="flex flex-col items-center" style={styles({ flex: 1, minWidth: 0 })}>
  <div
    class="relative w-full overflow-hidden"
    style={styles({
      aspectRatio: "1 / 0.7",
      borderRadius: 6,
      background: paper,
      boxShadow: selected ? "inset 0 0 0 2px var(--accent)" : pressed ? "inset 0 0 0 2px var(--muted)" : "inset 0 0 0 1px var(--line)",
      transform: pressed ? "scale(0.96)" : "scale(1)",
      transition: "transform 0.15s, box-shadow 0.2s",
    })}
  >
    <div class="absolute" style={styles({ left: "16%", right: "16%", top: "22%" })}>
      {#each LINES as w, i (i)}
        <div style={styles({ height: 2, width: `${w * 100}%`, background: ink, opacity: 0.55, marginBottom: 4, borderRadius: 1 })}></div>
      {/each}
    </div>
    {#if look.texture === "paper"}
      <div
        class="absolute inset-0"
        style={styles({
          opacity: 0.35,
          mixBlendMode: tokens.dark ? "screen" : "multiply",
          backgroundImage: "radial-gradient(rgba(0,0,0,.25) 0.5px, transparent 0.8px)",
          backgroundSize: "3px 3px",
        })}
      ></div>
    {/if}
  </div>
  <span class="mt-1 truncate" style={styles({ fontSize: 11, color: selected ? "var(--accent)" : "var(--ink)", maxWidth: "100%" })}
    >{name}</span
  >
</div>
