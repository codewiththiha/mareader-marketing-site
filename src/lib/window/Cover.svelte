<script lang="ts">
  import { styles } from "@/lib/style";
  import type { Book } from "@/lib/content";

  let { book, width }: { book: Book; width: number } = $props();

  const h = $derived(Math.round(width * 1.5));
  const big = $derived(width >= 56);
  const first = $derived(book.title.charAt(0));

  const shell = $derived(
    styles({
      width,
      height: h,
      borderRadius: `${Math.max(1, width * 0.03)}px ${Math.max(2, width * 0.07)}px ${Math.max(2, width * 0.07)}px ${Math.max(1, width * 0.03)}px`,
      background: `linear-gradient(180deg, color-mix(in srgb, ${book.tone} 82%, white) 0%, ${book.tone} 38%, color-mix(in srgb, ${book.tone} 86%, black) 100%)`,
      boxShadow: `0 1px 1px rgba(0,0,0,.25), 0 ${Math.max(2, width * 0.08)}px ${Math.max(6, width * 0.22)}px rgba(0,0,0,.22), inset 0 0 0 0.5px rgba(255,255,255,.14)`,
      color: "#e3c572",
      fontFamily: "var(--font-serif)",
    }),
  );
</script>

<div class="relative shrink-0" style={shell}>
  <span
    class="absolute inset-y-0"
    style={styles({ left: width * 0.1, width: 1, background: "rgba(0,0,0,.35)", boxShadow: "1px 0 0 rgba(255,255,255,.12)" })}
  ></span>
  {#if big}
    <div class="absolute inset-0 flex flex-col items-center" style={styles({ paddingTop: h * 0.17 })}>
      <div
        class="flex items-center justify-center"
        style={styles({
          width: width * 0.5,
          height: width * 0.5,
          border: "1px solid rgba(227,197,114,.75)",
          fontSize: width * 0.34,
          fontWeight: 500,
          lineHeight: 1,
        })}
      >
        {first}
      </div>
      <span class="mt-2 block" style={styles({ width: width * 0.22, height: 1, background: "rgba(227,197,114,.7)" })}></span>
      <span
        class="absolute"
        style={styles({
          bottom: h * 0.08,
          fontSize: Math.max(5, width * 0.085),
          letterSpacing: "0.22em",
          fontFamily: "var(--font-sans)",
        })}>{book.format}</span
      >
      {#if book.progress}
        <span
          class="absolute flex items-start justify-center"
          style={styles({
            top: -1,
            right: width * 0.14,
            width: width * 0.2,
            height: h * 0.2,
            background: "var(--accent)",
            color: "var(--ink-on-accent)",
            fontSize: Math.max(5, width * 0.08),
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            paddingTop: 3,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)",
          })}>{book.progress}%</span
        >
      {/if}
    </div>
  {:else}
    <div class="absolute inset-0 flex items-center justify-center" style={styles({ fontSize: width * 0.5, fontWeight: 500 })}>{first}</div>
  {/if}
</div>
