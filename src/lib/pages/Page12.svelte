<script lang="ts">
  import RichText from "./RichText.svelte";
  import { rich } from "./rich";
  import { P12 } from "./texts";

  const PW = 612;
  const PH = 792;
  const toks = $derived(P12.map((t) => rich(t)));
</script>

<div class="pdf" style="position: absolute; left: 0; top: 0; width: {PW}px; height: {PH}px">
  <div class="pdf-col" style="left: 92px; top: 82px; width: 429px">
    {#each toks as t, ti (ti)}
      <p><RichText tokens={t} /></p>
    {/each}
  </div>
</div>
