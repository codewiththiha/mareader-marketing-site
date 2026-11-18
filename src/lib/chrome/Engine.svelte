<script lang="ts">
  import Icon from "$lib/icons/Icon.svelte";
  import { ChevronDown, ChevronRight, Download, Pause } from "$lib/icons/nodes";

  let {
    name,
    sub,
    build,
    size,
    dl = false,
    ready = false,
    running = true,
    picked,
  }: {
    name: string;
    sub: string;
    build?: string;
    size?: string;
    dl?: boolean;
    ready?: boolean;
    running?: boolean;
    picked: boolean;
  } = $props();

  let mb = $state(12.4);
  let elapsed = 0;
  $effect(() => {
    if (!dl || !running) return;
    const start = performance.now() - elapsed;
    const id = window.setInterval(() => {
      elapsed = performance.now() - start;
      const k = Math.min(1, elapsed / 3400);
      mb = 12.4 + (347.9 - 12.4) * (1 - Math.pow(1 - k, 1.6));
      if (k === 1) window.clearInterval(id);
    }, 180);
    return () => {
      window.clearInterval(id);
    };
  });
</script>

<div class="st-eng">
  <span class="st-mt">
    <b>{name}</b>
    <small>{sub}</small>
  </span>
  {#if build}
    <span class="st-build">
      {build}
      <Icon node={ChevronDown} size={16} strokeWidth={2} ariaHidden />
    </span>
  {/if}
  {#if size}<span class="st-size">{dl ? `${mb.toFixed(1)} of ${size}` : size}</span>{/if}
  {#if size}
    {#if ready}
      <span class="st-manage">Manage <Icon node={ChevronRight} size={15} strokeWidth={2} ariaHidden /></span>
    {:else}
      <span class="st-dl"><Icon node={dl ? Pause : Download} size={21} strokeWidth={1.9} ariaHidden /></span>
    {/if}
  {/if}
  {#if !size || ready}<span class="st-radio" class:on={picked}></span>{/if}
  {#if dl}
    <span class="st-prog"><i class="dl-bar" style:animation-play-state={running ? "running" : "paused"}></i></span>
  {/if}
</div>
