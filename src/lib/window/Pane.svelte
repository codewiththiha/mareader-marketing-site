<script lang="ts">
  import { varsOf, type Look } from "$lib/looks";
  import type { R } from "./state";
  import type { Snippet } from "svelte";

  let {
    r,
    boxW,
    boxH,
    lk,
    on,
    title,
    count,
    low,
    divL = false,
    divT = false,
    enter = "",
    elBind = $bindable<HTMLDivElement | null>(null),
    children,
  }: {
    r: R;
    boxW: number;
    boxH: number;
    lk: Look;
    on: boolean;
    title: string;
    count: string;
    low: boolean;
    divL?: boolean;
    divT?: boolean;
    enter?: "" | "r" | "b";
    elBind?: HTMLDivElement | null;
    children: Snippet;
  } = $props();

  const cr = $derived(Math.max(0, boxW - r.w));
  const cb = $derived(Math.max(0, boxH - r.h));
</script>

<div
  bind:this={elBind}
  class="pane look"
  class:enter-r={enter === "r"}
  class:enter-b={enter === "b"}
  data-dark={lk.dark}
  style="{varsOf(
    lk,
  )};--py:{r.y}px;width:{boxW}px;height:{boxH}px;transform:translate3d({r.x}px,{r.y}px,0);clip-path:inset(0px {cr}px {cb}px 0px);opacity:{on
    ? 1
    : 0}"
>
  <div class="tex" class:off={lk.tx <= 0} style:opacity={lk.tx * (lk.dark ? 0.34 : 0.72)}></div>
  {@render children()}
  <div class="pane-title" style:transform="translate3d(0,{low ? 70 : 9}px,0)">{title}</div>
  <div class="pane-count" style:transform="translate3d(calc({r.w - 14}px - 100%),calc({r.h - 13}px - 100%),0)">{count}</div>
  {#if divL}<div class="pane-dl"></div>{/if}
  {#if divT}<div class="pane-dt"></div>{/if}
</div>
