<script lang="ts">
  import { Volume2, X } from "@lucide/svelte";
  import { styles } from "@/lib/style";
  import type { Box, WordAnswer } from "@/lib/overlays/types";

  const CARD_W = 320;
  const CARD_MARGIN = 14;
  const GAP = 11;
  const CARET = 8;

  let {
    at,
    room,
    answer,
    phase,
    progress,
  }: {
    at: Box;
    room: { x: number; w: number };
    answer: WordAnswer;
    phase: "waiting" | "partial" | "ready";
    progress: number;
  } = $props();

  const total = $derived(CARD_W + CARD_MARGIN * 2 + 2);
  const half = $derived(total / 2);
  const cx = $derived(Math.min(Math.max(at.x + at.w / 2, room.x + 8 + half), room.x + room.w - 8 - half));
  const left = $derived(cx - half);
  const caretX = $derived(at.x + at.w / 2 - left);
  const top = $derived(at.y + at.h + GAP);
  const meaningChars = $derived(Math.floor(answer.meaning.length * Math.min(1, progress * 1.6)));
  const synCount = $derived(Math.floor(answer.synonyms.length * Math.min(1, Math.max(0, (progress - 0.35) * 2.2))));
  const useCount = $derived(Math.floor(answer.usages.length * Math.min(1, Math.max(0, (progress - 0.6) * 2.6))));
  const heading = styles({ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 2 });
  const hint = styles({ fontSize: 12, color: "var(--muted)", marginTop: 2 });
</script>

<div
  data-focus="word-card"
  class="absolute z-40"
  style={styles({
    left,
    top,
    width: total,
    padding: CARD_MARGIN,
    borderRadius: 12,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    boxShadow: "0 8px 24px var(--shadow)",
    color: "var(--ink)",
    fontFamily: "var(--font-sans)",
    animation: "rise-in 0.16s var(--ease-out-quint) both",
  })}
>
  <span
    class="absolute"
    style={styles({
      left: caretX - CARET,
      top: -CARET,
      width: 0,
      height: 0,
      borderLeft: `${CARET}px solid transparent`,
      borderRight: `${CARET}px solid transparent`,
      borderBottom: `${CARET}px solid var(--line)`,
    })}
  ></span>
  <span
    class="absolute"
    style={styles({
      left: caretX - CARET + 1.2,
      top: -CARET + 1.6,
      width: 0,
      height: 0,
      borderLeft: `${CARET - 1.2}px solid transparent`,
      borderRight: `${CARET - 1.2}px solid transparent`,
      borderBottom: `${CARET - 1.2}px solid var(--surface)`,
    })}
  ></span>
  <div class="flex items-center" style={styles({ gap: 8 })}>
    <span style={styles({ fontSize: 19, fontWeight: 600 })}>{answer.word}</span>
    <span style={styles({ fontSize: 14, fontStyle: "italic", color: "var(--muted)" })}>{answer.pos}</span>
    <span style={styles({ fontSize: 12, fontWeight: 600, color: "var(--muted)" })}>{answer.level}</span>
    <span class="ml-auto flex items-center" style={styles({ gap: 2, color: "var(--muted)" })}>
      <Volume2 size={15} />
      <span style={styles({ width: 8 })}></span>
      <X size={15} />
    </span>
  </div>
  {#if phase === "waiting"}
    <div class="mt-3 flex flex-col" style={styles({ gap: 6 })}>
      {#each [0.35, 1, 0.8] as w, i (i)}
        <div
          style={styles({
            height: 12,
            width: `${w * 100}%`,
            borderRadius: 4,
            background: "var(--line)",
            animation: "breathe 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.12}s`,
          })}
        ></div>
      {/each}
      <div style={hint}>Looking up…</div>
    </div>
  {:else}
    <div class="flex flex-col" style={styles({ gap: 6, marginTop: 4 })}>
      <div style={heading}>Meaning</div>
      <p style={styles({ fontSize: 14, lineHeight: 1.45, minHeight: 20 })}>{answer.meaning.slice(0, meaningChars)}</p>
      {#if synCount > 0}
        <div style={heading}>Synonyms</div>
        <div class="flex flex-wrap" style={styles({ gap: "6px 4px" })}>
          {#each answer.synonyms.slice(0, synCount) as s (s)}
            <span
              style={styles({
                fontSize: 12,
                padding: "3px 8px",
                borderRadius: 8,
                background: "var(--accent-soft)",
                animation: "rise-in 0.2s ease both",
              })}>{s}</span
            >
          {/each}
        </div>
      {/if}
      {#if useCount > 0}
        <div style={heading}>Usages</div>
        {#each answer.usages.slice(0, useCount) as u (u)}
          <div class="flex" style={styles({ gap: 6, fontSize: 14, lineHeight: 1.4, animation: "rise-in 0.2s ease both" })}>
            <span style={styles({ color: "var(--muted)" })}>•</span>
            <span style={styles({ fontStyle: "italic" })}>{u}</span>
          </div>
        {/each}
      {/if}
      {#if phase === "partial"}
        <div style={hint}>Looking up…</div>
      {:else}
        <div class="flex items-center justify-between" style={styles({ marginTop: 4, fontSize: 12 })}>
          <span style={styles({ color: "var(--muted)" })}>{answer.by}</span>
          <span style={styles({ color: "var(--accent)" })}>Ask again</span>
        </div>
      {/if}
    </div>
  {/if}
</div>
