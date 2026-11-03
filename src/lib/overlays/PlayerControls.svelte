<script lang="ts">
  import { Pause, Play, SkipBack, SkipForward, Square } from "@lucide/svelte";
  import { styles } from "@/lib/style";
  import PlayerTrack from "@/lib/overlays/PlayerTrack.svelte";
  import IconButton from "@/lib/window/IconButton.svelte";

  let { playing, at, left, speed, track }: { playing: boolean; at: number; left: string; speed: string; track: number } = $props();
</script>

<div class="flex items-center" style={styles({ gap: 2 })}>
  <IconButton icon={SkipBack} size={32} iconSize={16} />
  <div
    class="flex items-center justify-center"
    style={styles({ width: 36, height: 36, borderRadius: 18, background: "var(--accent)", color: "var(--ink-on-accent)" })}
  >
    {#if playing}
      <Pause size={16} fill="currentColor" strokeWidth={0} />
    {:else}
      <Play size={16} fill="currentColor" strokeWidth={0} style="margin-left:2px" />
    {/if}
  </div>
  <IconButton icon={SkipForward} size={32} iconSize={16} />
  <span style={styles({ width: 6 })}></span>
  <PlayerTrack {at} {left} width={track} />
  <span class="tabular-nums" style={styles({ width: 54, fontSize: 12, textAlign: "center", color: "var(--ink)" })}>{speed}</span>
  <IconButton icon={Square} size={32} iconSize={14} />
</div>
