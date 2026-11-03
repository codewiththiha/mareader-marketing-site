<script lang="ts">
  import { ALICE } from "./texts";
</script>

<div class="epub" style="position: absolute; left: 0; top: 0; width: 768px; font-size: 17px; line-height: 27.7px">
  <div style="position: absolute; left: 63px; top: 59px; width: 258px">
    {#each ALICE[0] as l, li (li)}
      <span class="jl" class:e={l.e === true} style:text-indent={l.i ? "16px" : undefined}>{l.t}</span>
    {/each}
  </div>
  <div style="position: absolute; left: 447px; top: 59px; width: 258px">
    {#each ALICE[1] as l, li (li)}
      <span class="jl" class:e={l.e === true} style:text-indent={l.i ? "16px" : undefined}>{l.t}</span>
    {/each}
  </div>
</div>
