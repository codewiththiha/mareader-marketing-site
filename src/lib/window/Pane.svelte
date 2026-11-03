<script lang="ts">
  import { varsOf, type Look } from "$lib/looks";
  import type { R } from "./state";
  import type { Snippet } from "svelte";

  let {
    r,
    lk,
    on,
    title,
    count,
    low,
    divL = false,
    divT = false,
    elBind = $bindable<HTMLDivElement | null>(null),
    children,
  }: {
    r: R;
    lk: Look;
    on: boolean;
    title: string;
    count: string;
    low: boolean;
    divL?: boolean;
    divT?: boolean;
    elBind?: HTMLDivElement | null;
    children: Snippet;
  } = $props();
</script>

<div
  bind:this={elBind}
  class="pane look"
  data-dark={lk.dark}
  style="{varsOf(lk)};left:{r.x}px;top:{r.y}px;width:{r.w}px;height:{r.h}px;opacity:{on ? 1 : 0}"
>
  <div class="tex"></div>
  {@render children()}
  <div class="pane-title" style:top={low ? "70px" : "9px"}>{title}</div>
  <div class="pane-count">{count}</div>
  {#if divL}<div class="pane-dl"></div>{/if}
  {#if divT}<div class="pane-dt"></div>{/if}
</div>
