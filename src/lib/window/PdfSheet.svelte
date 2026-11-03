<script lang="ts">
  import { PAPER } from "@/lib/content";
  import type { Appearance } from "@/lib/palette";
  import { styles } from "@/lib/style";
  import TextureLayer from "@/lib/window/TextureLayer.svelte";

  let { page, sheet, fs, look, dark }: { page: number; sheet: number; fs: number; look: Appearance; dark: boolean } = $props();
  const body = $derived([...PAPER.body, PAPER.abstract]);
</script>

<div
  class="relative mx-auto overflow-hidden"
  style={styles({
    width: sheet,
    height: sheet * 1.294,
    background: "var(--page-paper)",
    color: "var(--page-ink)",
    boxShadow: dark
      ? "0 2px 10px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04)"
      : "0 1px 2px rgba(0,0,0,.12), 0 4px 14px rgba(0,0,0,.14)",
    padding: `${sheet * 0.09}px ${sheet * 0.1}px`,
    fontFamily: "var(--font-serif)",
    fontSize: fs,
    lineHeight: 1.42,
    textAlign: "justify",
    hyphens: "auto",
  })}
>
  {#if page === 1}
    <div style={styles({ textAlign: "center", fontSize: fs * 1.75, fontWeight: 600, lineHeight: 1.15 })}>{PAPER.title}</div>
    <div style={styles({ textAlign: "center", fontStyle: "italic", fontSize: fs * 1.15, marginTop: fs * 0.9 })}>By {PAPER.author}</div>
    <div
      style={styles({
        textAlign: "center",
        fontSize: fs * 0.85,
        color: "var(--muted)",
        marginTop: fs * 0.3,
        marginBottom: fs * 1.6,
      })}
    >
      {PAPER.note}
    </div>
    <p style={styles({ marginInline: sheet * 0.06, fontSize: fs * 0.92 })}>{PAPER.abstract}</p>
    <div style={styles({ columns: 2, columnGap: sheet * 0.05, marginTop: fs * 1.2 })}>
      <div style={styles({ fontWeight: 600, textAlign: "center", marginBottom: fs * 0.5 })}>I. KINEMATICAL PART</div>
      <div style={styles({ fontStyle: "italic", textAlign: "center", marginBottom: fs * 0.6 })}>§ 1. Definition of Simultaneity</div>
      {#each PAPER.body as p, i (i)}
        <p style={styles({ marginBottom: fs * 0.55 })}>
          {p}{#if i === 1}
            <span class="block" style={styles({ textAlign: "center", fontStyle: "italic", margin: `${fs * 0.6}px 0`, fontSize: fs * 1.15 })}
              >τ = β (t − v x / c²), ξ = β (x − v t)</span
            >
          {/if}
        </p>
      {/each}
    </div>
  {:else}
    <div style={styles({ columns: 2, columnGap: sheet * 0.05 })}>
      {#each body as p, i (i)}
        <p style={styles({ marginBottom: fs * 0.55 })}>{p}</p>
      {/each}
    </div>
  {/if}
  <span
    class="absolute inset-x-0"
    style={styles({
      bottom: sheet * 0.035,
      textAlign: "center",
      fontSize: fs * 0.9,
      fontFamily: "var(--font-sans)",
      color: "var(--muted)",
    })}>{page + 890}</span
  >
  <TextureLayer {look} {dark} />
</div>
