<script lang="ts">
  import { CLASSIC, CUSTOM, LOOKS, hueColour, type LookId } from "$lib/looks";
  import Icon from "$lib/icons/Icon.svelte";
  import { ChevronDown, ChevronUp, Eclipse, Moon, Plus, Sun, SunMoon, type IconNode } from "$lib/icons/nodes";

  let { shown, mode, sel, perPane, lit }: { shown: boolean; mode: "themes" | "split"; sel: LookId; perPane: boolean; lit: string | null } =
    $props();

  const L = $derived(LOOKS[sel]);
  const colourSum = $derived(`${L.mode}${L.strength ? ` · ${L.hueName} ${L.strength}%` : ""}`);
  const texSum = $derived(L.texture === "None" ? "None" : `Real paper · ${L.texOpacity}%`);
  const grainSum = $derived(L.grain === "Off" ? "Off" : `${L.grain} · ${L.grainI}%`);
  const HUES: [number, string][] = [
    [34, "Sepia"],
    [14, "Rose"],
    [104, "Green"],
    [160, "Mint"],
    [200, "Sky"],
    [240, "Blue"],
    [290, "Violet"],
  ];
  const HUE_STRIP = `linear-gradient(90deg, ${Array.from({ length: 13 }, (_, i) => hueColour(i * 30)).join(", ")})`;
  const MODES: [string, IconNode][] = [
    ["Light", Sun],
    ["Dark", Moon],
    ["Dim", SunMoon],
    ["Black", Eclipse],
  ];
  const TEXTURES: [string, IconNode | null][] = [
    ["None", null],
    ["Real paper", null],
    ["Lined", null],
    ["Grid", null],
    ["Dotted", null],
    ["Cross", null],
  ];
</script>

{#snippet fold(title: string, summary: string, open = false, plus = false)}
  <div class="fold">
    <span class="fold-t">{title}</span>
    <span class="fold-s">{summary}</span>
    {#if plus}<span class="fold-plus"><Icon node={Plus} size={14} strokeWidth={2} ariaHidden /></span>{/if}
    <span class="fold-c"><Icon node={open ? ChevronUp : ChevronDown} size={14} strokeWidth={2} ariaHidden /></span>
  </div>
{/snippet}

{#snippet cards(ids: LookId[])}
  <div class="pop-cards">
    {#each ids as id (id)}
      {@const P = LOOKS[id]}
      <div class="pc">
        <div class="pc-page" class:sel={sel === id} style:background={P.p}>
          {#each [0, 1, 2, 3, 4] as i (i)}
            <i style:background={P.mode === "Dim" ? "#0d1015" : P.k} style:width={i === 4 ? "48%" : "100%"}></i>
          {/each}
        </div>
        <div class="pc-name" class:sel={sel === id}>{P.name}</div>
      </div>
    {/each}
  </div>
{/snippet}

{#snippet segs(items: [string, IconNode | null][], value: string, cols: number)}
  <div class="segs" style:grid-template-columns={`repeat(${cols}, 1fr)`}>
    {#each items as [name, node] (name)}
      <div class="seg" class:on={name === value}>
        {#if node}<Icon {node} size={13} strokeWidth={2} ariaHidden />{/if}
        <span>{name}</span>
      </div>
    {/each}
  </div>
{/snippet}

{#snippet dial(name: string, v: number, label: string, dim = false)}
  <div class="dial" style:opacity={dim ? 0.45 : 1}>
    <span class="dial-n">{name}</span>
    <span class="dial-t">
      <span class="dial-f" style:width={`${v}%`}></span>
      <span class="dial-k" style:left={`${v}%`}></span>
    </span>
    <span class="dial-v">{label}</span>
  </div>
{/snippet}

<div class="pop" class:on={shown}>
  {@render fold("Presets", L.name, true, true)}
  {@render cards(CLASSIC)}
  <div class="pop-sec">Custom</div>
  {@render cards(CUSTOM)}
  {#if mode === "themes"}
    {@render fold("Mode & colour", colourSum, true)}
    {@render segs(MODES, L.mode, 4)}
    <div class="dial">
      <span class="dial-n">Hue</span>
      <span class="hue" style:background={HUE_STRIP}>
        <span class="dial-k" style:left={`${(L.hue / 359) * 100}%`}></span>
      </span>
      <span class="dial-v">{L.hue}°</span>
    </div>
    <div class="swatches">
      {#each HUES as [h, n] (n)}
        <span title={n} class="swatch" class:on={Math.abs(h - L.hue) < 8} style:background={hueColour(h)}></span>
      {/each}
    </div>
    {@render dial("Strength", L.strength, `${L.strength}%`)}
    {@render fold("Page texture", texSum, true)}
    {@render segs(TEXTURES, L.texture, 3)}
    {@render dial("Opacity", L.texOpacity, `${L.texOpacity}%`, L.texture === "None")}
    {@render dial("Scale", 30, "110%", L.texture === "None")}
    {@render fold("Film grain", grainSum)}
  {:else}
    {@render fold("Mode & colour", colourSum)}
    {@render fold("Page texture", texSum)}
    {@render fold("Film grain", grainSum)}
    <div class="pop-hr"></div>
    <div class="pop-sec">Split view</div>
    <div class="pop-row spot" class:lit={lit === "perpane"}>
      <span>Theme per pane</span>
      <span class="sw" class:on={perPane}><i></i></span>
    </div>
    <div class="pop-row">
      <span>Texture per pane</span>
      <span class="sw"><i></i></span>
    </div>
    <div class="pop-note">Film grain stays shared.</div>
  {/if}
</div>
