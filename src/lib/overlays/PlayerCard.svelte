<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Book } from "@/lib/content";
  import { styles } from "@/lib/style";
  import Cover from "@/lib/window/Cover.svelte";
  import PlayerControls from "@/lib/overlays/PlayerControls.svelte";

  let {
    x,
    y,
    book,
    playing,
    at,
    left,
    speed,
    place,
    narrator,
    before,
    now,
    after,
  }: {
    x: number;
    y: number;
    book: Book;
    playing: boolean;
    at: number;
    left: string;
    speed: string;
    place: string;
    narrator: string;
    before?: string;
    now: Snippet;
    after?: string;
  } = $props();
</script>

<div
  data-focus="player"
  class="absolute z-40 flex flex-col"
  style={styles({
    left: x,
    top: y,
    transform: "translateX(-50%)",
    width: 420,
    height: 224,
    padding: 14,
    borderRadius: 18,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    boxShadow: "0 14px 42px var(--shadow)",
    animation: "rise-in 0.3s var(--ease-out-quint) both",
  })}
>
  <div class="flex min-h-0 flex-1" style={styles({ gap: 14 })}>
    <Cover {book} width={70} />
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex items-center" style={styles({ gap: 8 })}>
        <span class="truncate" style={styles({ fontSize: 15, fontWeight: 500 })}>{book.title}</span>
        <span class="flex shrink-0 items-end" style={styles({ gap: 2, height: 14, width: 18 })}>
          {#each [0, 1, 2] as i (i)}
            <span
              class="block flex-1 origin-bottom rounded-sm"
              style={styles({
                height: "100%",
                background: "var(--accent)",
                animation: playing ? `bars 0.9s ease-in-out ${i * 0.15}s infinite` : "none",
                transform: playing ? undefined : "scaleY(0.35)",
              })}
            ></span>
          {/each}
        </span>
      </div>
      <div class="truncate" style={styles({ fontSize: 12, color: "var(--muted)" })}>{place} · {narrator}</div>
      <div class="relative mt-2 min-h-0 flex-1 overflow-hidden" style={styles({ lineHeight: 1.35, fontFamily: "var(--font-serif)" })}>
        {#if before}
          <div class="truncate" style={styles({ fontSize: 13, color: "var(--muted)" })}>{before}</div>
        {/if}
        <div style={styles({ fontSize: 16, color: "var(--ink)", marginTop: 2 })}>{@render now()}</div>
        {#if after}
          <div class="truncate" style={styles({ fontSize: 13, color: "var(--muted)", marginTop: 2 })}>{after}</div>
        {/if}
        <div
          class="pointer-events-none absolute inset-x-0 bottom-0"
          style={styles({ height: 18, background: "linear-gradient(transparent, var(--surface))" })}
        ></div>
      </div>
    </div>
  </div>
  <div class="mt-2 flex justify-center">
    <PlayerControls {playing} {at} {left} {speed} track={160} />
  </div>
</div>
