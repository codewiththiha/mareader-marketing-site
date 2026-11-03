<script lang="ts">
  import type { Snippet } from "svelte";
  import { MOBY, PRIDE, WALDEN, type Book } from "@/lib/content";
  import { styles } from "@/lib/style";

  interface Passage {
    chapter: string;
    heading: string;
    paragraphs: string[];
  }

  const TEXTS: Record<string, Passage> = {
    moby: MOBY,
    pride: PRIDE,
    walden: WALDEN,
    raven: MOBY,
    dracula: WALDEN,
  };

  let {
    book,
    width,
    offset = 0,
    top = 64,
    children,
  }: {
    book: Book;
    width: number;
    offset?: number;
    top?: number;
    children?: Snippet;
  } = $props();

  const text = $derived(TEXTS[book.id] ?? MOBY);
  const size = $derived(width >= 700 ? 17 : width >= 480 ? 15 : 13.5);
</script>

<div
  class="absolute inset-0 overflow-hidden"
  style={styles({ color: "var(--page-ink)", background: "var(--page-paper)", fontFamily: "var(--font-serif)" })}
>
  <div
    class="mx-auto"
    style={styles({
      maxWidth: 560,
      padding: `${top}px 40px 40px`,
      fontSize: size,
      lineHeight: 1.58,
      transform: `translateY(${-offset}px)`,
      transition: "transform 1.1s var(--ease-out-quint)",
    })}
  >
    <div
      style={styles({
        fontFamily: "var(--font-sans)",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--muted)",
        marginBottom: 6,
      })}
    >
      {text.chapter}
    </div>
    {#if text.heading}
      <h3 style={styles({ fontSize: size * 1.55, fontWeight: 600, lineHeight: 1.2, marginBottom: size * 1.1 })}>{text.heading}</h3>
    {/if}
    {#if children}
      {@render children()}
    {:else}
      {#each text.paragraphs as p, i (i)}
        <p style={styles({ textAlign: "justify", hyphens: "auto", textIndent: i === 0 ? 0 : "1.4em" })}>{p}</p>
      {/each}
    {/if}
  </div>
</div>
