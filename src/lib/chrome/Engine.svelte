<script lang="ts">
  import Icon from "$lib/icons/Icon.svelte";
  import { ChevronDown, ChevronRight, Download, Pause } from "$lib/icons/nodes";
  import { perf } from "$lib/utils/perf.svelte";

  let {
    name,
    sub,
    build,
    size,
    dl = false,
    ready = false,
    picked,
    speed = 1,
  }: {
    name: string;
    sub: string;
    build?: string;
    size?: string;
    dl?: boolean;
    ready?: boolean;
    picked: boolean;
    speed?: number;
  } = $props();

  let prog = $state(0.04);
  let rate = 1;
  $effect(() => {
    rate = speed;
  });

  $effect(() => {
    if (!dl) {
      prog = 0.04;
      return;
    }
    let elapsed = 0;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      if (!perf.hidden) elapsed += (now - last) * rate;
      last = now;
      const k = Math.min(1, elapsed / 3400);
      prog = 0.04 + 0.96 * (1 - Math.pow(1 - k, 1.6));
      if (k >= 1) window.clearInterval(id);
    }, 85);
    return () => {
      window.clearInterval(id);
    };
  });

  const mb = $derived(12.4 + (347.9 - 12.4) * ((prog - 0.04) / 0.96));
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
    <span class="st-prog"><i class="dl-bar" style:transform="scaleX({prog.toFixed(3)})"></i></span>
  {/if}
</div>
