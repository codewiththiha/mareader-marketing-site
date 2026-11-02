<script lang="ts">
  // WordCard — AI dictionary popup
  import { Volume2, X } from "@lucide/svelte";
  let { open }: { open: boolean } = $props();
  let mounted = $state(false);
  let show = $state(false);
  let ref: HTMLDivElement | undefined = $state();
  let shift = $state(0);
  let timer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    if (open) { mounted = true; requestAnimationFrame(()=>requestAnimationFrame(()=>show=true)); }
    else { show=false; timer=setTimeout(()=>mounted=false,360); }
    return ()=>clearTimeout(timer);
  });
  $effect(() => {
    if (!mounted) return;
    const measure = () => {
      const card = ref; const word = card?.parentElement; const pane = word?.closest(".mk-pane") as HTMLElement | null;
      if (!card || !word || !pane) return;
      let x=0; let cur: HTMLElement | null = word;
      while(cur && cur!==pane){ x+=cur.offsetLeft; cur=cur.offsetParent as HTMLElement | null; }
      const centre = x + word.offsetWidth/2; const half = card.offsetWidth/2;
      const clamped = Math.min(Math.max(centre, 12+half), pane.offsetWidth -12 - half);
      shift = Math.round(clamped - centre);
    };
    measure(); document.fonts?.ready.then(measure); window.addEventListener("resize", measure);
    return ()=>window.removeEventListener("resize", measure);
  });
</script>

{#if mounted}
  <div bind:this={ref} class="mk-bubble mk-card {show ? 'on' : ''}" style="--shift:{shift}px" data-focus="bubble">
    <i class="mk-caret up"></i>
    <div class="mk-card-head"><b>spleen</b><em>noun</em><small>C2</small>
      <span class="mk-card-tools"><span class="mk-sbtn"><Volume2 size={15} strokeWidth={1.75} /></span><span class="mk-sbtn"><X size={15} strokeWidth={1.75} /></span></span>
    </div>
    <div class="mk-stream s1"><h5>Meaning</h5><p>Low spirits or ill temper, once believed to rise from the organ itself and sour the mood.</p></div>
    <div class="mk-stream s2"><h5>Synonyms</h5><div class="mk-chips"><span>gloom</span><span>ill humour</span><span>melancholy</span></div></div>
    <div class="mk-stream s3"><h5>Usages</h5><ul><li><i>He nursed his spleen in silence.</i></li><li><i>A fit of spleen kept her indoors.</i></li></ul></div>
    <div class="mk-card-foot mk-stream s4"><span>Ollama · gemma3</span><u>Ask again</u></div>
  </div>
{/if}
