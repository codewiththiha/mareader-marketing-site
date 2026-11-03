<script lang="ts">
  import Icon from "$lib/icons/Icon.svelte";
  import Logo from "$lib/icons/Logo.svelte";
  import { ChevronDown, type IconNode } from "$lib/icons/nodes";
  import type { LogoName } from "$lib/icons/logos";

  let {
    logo,
    name,
    sub,
    pills,
    chev = ChevronDown,
  }: { logo: LogoName; name: string; sub: string; pills: string[]; chev?: IconNode } = $props();
</script>

<div class="st-model">
  <span class="st-logo"><Logo name={logo} size={22} /></span>
  <span class="st-mt">
    <b>{name}</b>
    <small>{sub}</small>
  </span>
  <span class="st-pills">
    {#each pills as p (p)}<span>{p}</span>{/each}
  </span>
  <span class="st-chev"><Icon node={chev} size={18} strokeWidth={2} ariaHidden /></span>
</div>
