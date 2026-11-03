<script lang="ts">
  // Pill — segmented control with a sliding mark and a hover ghost
  import type { Component } from "svelte";

  export interface PillItem {
    id: string;
    label: string;
    href?: string;
    title?: string;
    icon?: Component<{ size?: number; strokeWidth?: number; class?: string }>;
  }

  let {
    items,
    active,
    mode = "choice",
    onSelect,
    ariaLabel,
    dense = false,
    bare = false
  }: {
    items: PillItem[];
    active: string;
    mode?: "nav" | "choice";
    onSelect?: (id: string) => void;
    ariaLabel?: string;
    dense?: boolean;
    bare?: boolean;
  } = $props();

  let track = $state<HTMLDivElement | undefined>();
  let nodes = $state<Record<string, HTMLElement | undefined>>({});
  let markX = $state(0);
  let markW = $state(0);
  let ghostX = $state(0);
  let ghostW = $state(0);
  let ghostOn = $state(false);
  let ready = $state(false);

  function moveTo(el: HTMLElement | undefined) {
    if (!el) return;
    markX = el.offsetLeft;
    markW = el.offsetWidth;
    if (!ready) requestAnimationFrame(() => (ready = true));
  }
  function hoverTo(el: HTMLElement | undefined) {
    if (!el) {
      ghostOn = false;
      return;
    }
    ghostX = el.offsetLeft;
    ghostW = el.offsetWidth;
    ghostOn = true;
  }

  $effect(() => {
    void items;
    moveTo(nodes[active]);
  });
  $effect(() => {
    const t = track;
    if (!t) return;
    const ro = new ResizeObserver(() => moveTo(nodes[active]));
    ro.observe(t);
    document.fonts?.ready.then(() => moveTo(nodes[active]));
    return () => ro.disconnect();
  });

  function select(id: string) {
    onSelect?.(id);
  }

  function keydown(e: KeyboardEvent) {
    if (mode !== "choice") return;
    const i = items.findIndex((it) => it.id === active);
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % items.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (i - 1 + items.length) % items.length;
    if (next < 0) return;
    e.preventDefault();
    select(items[next].id);
    nodes[items[next].id]?.focus();
  }
</script>

<div
  bind:this={track}
  class="pill {dense ? 'dense' : ''} {bare ? 'bare' : ''} {ready ? 'ready' : ''}"
  role={mode === "choice" ? "radiogroup" : undefined}
  aria-label={ariaLabel}
  onkeydown={keydown}
  onmouseleave={() => (ghostOn = false)}
>
  <span
    class="pill-ghost"
    class:on={ghostOn}
    style="--x:{ghostX}px;--w:{ghostW}px"
    aria-hidden="true"
  ></span>
  <span class="pill-mark" style="--x:{markX}px;--w:{markW}px" aria-hidden="true"></span>
  {#each items as it (it.id)}
    {@const El = it.href ? "a" : "button"}
    <svelte:element
      this={El}
      bind:this={nodes[it.id]}
      href={it.href}
      data-id={it.id}
      role={mode === "choice" ? "radio" : undefined}
      aria-checked={mode === "choice" ? it.id === active : undefined}
      aria-current={mode === "nav" && it.id === active ? "page" : undefined}
      tabindex={mode === "choice" ? (it.id === active ? 0 : -1) : undefined}
      class="pill-item {it.id === active ? 'on' : ''}"
      title={it.title}
      onclick={() => select(it.id)}
      onmouseenter={(e: MouseEvent) => hoverTo(e.currentTarget as HTMLElement)}
      onfocus={(e: FocusEvent) => hoverTo(e.currentTarget as HTMLElement)}
      onblur={() => (ghostOn = false)}
    >
      {#if it.icon}<it.icon size={dense ? 14 : 15} strokeWidth={1.9} />{/if}
      <span class="pill-label">{it.label}</span>
    </svelte:element>
  {/each}
</div>
