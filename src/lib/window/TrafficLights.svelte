<script lang="ts">
  const DOTS = ["#ff5f57", "#febc2e", "#28c840"];
  let { style = "" }: { style?: string } = $props();
</script>

<div class="flex items-center gap-2" {style}>
  {#each DOTS as c (c)}
    <span class="block rounded-full" style="width:12px;height:12px;background:{c}"></span>
  {/each}
</div>
