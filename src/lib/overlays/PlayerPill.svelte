<script lang="ts">
  import { styles } from "@/lib/style";
  import PlayerControls from "@/lib/overlays/PlayerControls.svelte";

  let {
    x,
    y,
    playing,
    at,
    left,
    speed,
  }: {
    x: number;
    y: number;
    playing: boolean;
    at: number;
    left: string;
    speed: string;
  } = $props();
</script>

<div
  data-focus="player"
  class="absolute z-40 flex items-center"
  style={styles({
    left: x,
    top: y,
    transform: "translateX(-50%)",
    height: 44,
    padding: "0 6px",
    borderRadius: 22,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    boxShadow: "0 8px 24px var(--shadow)",
    animation: "rise-in 0.25s var(--ease-out-quint) both",
  })}
>
  <PlayerControls {playing} {at} {left} {speed} track={168} />
</div>
