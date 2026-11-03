<script lang="ts">
  import Icon from "$lib/icons/Icon.svelte";
  import Engine from "./Engine.svelte";
  import { ChevronDown, Play } from "$lib/icons/nodes";

  let { voice }: { voice: "downloading" | "ready" } = $props();
  const ready = $derived(voice === "ready");
</script>

<div>
  <div class="st-sec">Engine</div>
  <div class="st-card">
    <Engine name="System voices" sub="Built into your system" picked={!ready} />
    <Engine name="Kokoro" sub="7 languages · 49 voices" build="Full" size="347.9 MB" dl={!ready} {ready} picked={ready} />
    <Engine name="Piper" sub="English · 8 voices" size="83.7 MB" picked={false} />
    <Engine name="Kitten" sub="English · 8 voices" build="Mini" size="92.2 MB" picked={false} />
    <Engine name="Phonon" sub="English · 26 voices" size="65.1 MB" picked={false} />
  </div>
  <div class="st-sec">Voice</div>
  <div class="st-card">
    <div class="st-row">
      <span>Voices</span>
      <span class="st-quiet">
        {ready ? "Heart · American English" : "System default"}
        <Icon node={ChevronDown} size={16} strokeWidth={2} ariaHidden />
      </span>
    </div>
    <div class="st-row last">
      <span>Hear a sample</span>
      <span class="st-btn"><Icon node={Play} size={14} strokeWidth={2} ariaHidden /> Preview</span>
    </div>
  </div>
</div>
