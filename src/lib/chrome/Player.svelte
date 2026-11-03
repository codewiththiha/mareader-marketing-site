<script lang="ts">
  import Icon from "$lib/icons/Icon.svelte";
  import { ChevronUp, Ellipsis, Pause, SkipBack, SkipForward, X } from "$lib/icons/nodes";

  let { shown, t }: { shown: boolean; t: number } = $props();
</script>

<div class="pl" class:on={shown}>
  <span class="pl-b" style:left="14px"><Icon node={SkipBack} size={20} strokeWidth={1.8} ariaHidden /></span>
  <span class="pl-play"><Icon node={Pause} size={17} strokeWidth={2.2} fill="currentColor" ariaHidden /></span>
  <span class="pl-b" style:left="101px"><Icon node={SkipForward} size={20} strokeWidth={1.8} ariaHidden /></span>
  <span class="pl-track">
    <i style:width={`${t}%`}></i>
    <b style:left={`${t}%`}></b>
  </span>
  <span class="pl-b" style:left="250px"><Icon node={ChevronUp} size={20} strokeWidth={1.8} ariaHidden /></span>
  <span class="pl-b" style:left="293px"><Icon node={Ellipsis} size={20} strokeWidth={1.8} ariaHidden /></span>
  <span class="pl-div"></span>
  <span class="pl-b" style:left="341px"><Icon node={X} size={20} strokeWidth={1.8} ariaHidden /></span>
</div>
