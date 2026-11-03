<script lang="ts">
  import { CHAMBER } from "./texts";
</script>

{#each [26, 220] as right, i (right)}
  <div class="cjk" style="position: absolute; top: 105px; right: {right}px; height: 304px; font-size: 15.8px; line-height: 26.6px">
    {#each CHAMBER.slice(i * 6, i * 6 + 6) as c, ci (ci)}
      <div style="white-space: nowrap">{c}</div>
    {/each}
  </div>
{/each}
