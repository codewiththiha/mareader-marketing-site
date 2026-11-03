<script lang="ts">
  import { RAVEN } from "./texts";

  let { w }: { w: number } = $props();
</script>

<div class="epub pv-x" style="position: absolute; left: {(w - 305) / 2}px; top: 0; width: 305px">
  <div
    style="position: absolute; top: 188px; width: 305px; text-align: center; font-weight: 700; font-size: 26.5px; line-height: 32px; letter-spacing: 0.01em"
  >
    COMMENT ON THE
    <br />
    POEM.
  </div>
  <div style="position: absolute; top: 272px; width: 305px; font-size: 17px; line-height: 27.7px">
    {#each RAVEN as l, li (li)}
      <span class="jl" class:e={l.e === true}>{l.t}</span>
    {/each}
  </div>
</div>
