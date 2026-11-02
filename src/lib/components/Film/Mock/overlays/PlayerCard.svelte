<script lang="ts">
  // PlayerCard — read-aloud lyrics
  import { SkipBack, SkipForward, Pause, Square } from "@lucide/svelte";
  let { open, tick }: { open: boolean; tick: number } = $props();
  let mounted = $state(false);
  let show = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => { if(open){mounted=true; requestAnimationFrame(()=>requestAnimationFrame(()=>show=true));} else {show=false; timer=setTimeout(()=>mounted=false,360);} return()=>clearTimeout(timer); });
  const words = ["It","is","a","way","I","have","of","driving","off","the","spleen","and","regulating","the","circulation."];
  let start = 7;
  let lit = $derived(start + 1 + (tick % 4));
  const BARS = [0.5, 0.9, 0.35, 0.75];
</script>

{#if mounted}
  <div class="mk-player {show ? 'on' : ''}" data-focus="player">
    <div class="mk-cover"><span>M</span></div>
    <div class="mk-player-main">
      <div class="mk-player-title"><b>Moby-Dick</b><span class="mk-eq" aria-hidden="true">{#each BARS as b,i}<i style="animation-delay:{i*0.13}s;height:{b*100}%"></i>{/each}</span></div>
      <div class="mk-player-place">Chapter 1 · Loomings</div>
      <div class="mk-lyrics">
        <div class="before">Some years ago, never mind how long precisely.</div>
        <div class="now">{#each words as w,i}<span class={i <= lit && i >= start ? "lit" : ""}>{w}{#if i < words.length - 1}{" "}{/if}</span>{/each}</div>
        <div class="after">Whenever I find myself growing grim about the mouth.</div>
      </div>
      <div class="mk-player-ctl">
        <span class="mk-sbtn"><SkipBack size={16} strokeWidth={1.75} /></span>
        <span class="mk-play"><Pause size={16} strokeWidth={0} fill="currentColor" /></span>
        <span class="mk-sbtn"><SkipForward size={16} strokeWidth={1.75} /></span>
        <div class="mk-seek"><i style="width:34%"></i></div>
        <small>4:12</small><small class="mk-speed">1.0×</small>
        <span class="mk-sbtn"><Square size={13} strokeWidth={1.75} /></span>
      </div>
    </div>
  </div>
{/if}
