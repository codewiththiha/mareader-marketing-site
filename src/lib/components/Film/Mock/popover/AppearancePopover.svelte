<script lang="ts">
  // AppearancePopover — theme dials
  import { ChevronDown, ChevronRight, Contrast, Moon, Plus, Sun, SunDim } from "@lucide/svelte";
  import { PRESETS, THEMES } from "@/lib/themes";
  import type { AppTheme } from "@/lib/themes";
  import type { Fold } from "@/lib/scenes";

  let {
    open,
    theme,
    folds,
    split,
    perPane
  }: { open: boolean; theme: AppTheme; folds: Fold[]; split: boolean; perPane: boolean } = $props();
  let mounted = $state(false);
  let show = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    if (open) {
      mounted = true;
      requestAnimationFrame(() => requestAnimationFrame(() => (show = true)));
    } else {
      show = false;
      timer = setTimeout(() => (mounted = false), 360);
    }
    return () => clearTimeout(timer);
  });

  let has = (f: Fold) => folds.includes(f);
  let preset = $derived(PRESETS.includes(theme.id) ? theme.name : "Unsaved look");
  const MODES = [
    { label: "Light", icon: Sun },
    { label: "Dark", icon: Moon },
    { label: "Dim", icon: SunDim },
    { label: "Black", icon: Contrast }
  ];
  let modeIdx = $derived(MODES.findIndex((m) => m.label === theme.base));
  let grain = $derived(theme.grain ? "Static · 18%" : "Off");
  const TEXTURES = ["None", "Real paper", "Lined", "Grid", "Dotted", "Cross"];
  const RAINBOW =
    "linear-gradient(90deg,hsl(0 75% 62%),hsl(40 80% 58%),hsl(90 60% 52%),hsl(150 55% 48%),hsl(200 70% 55%),hsl(260 65% 62%),hsl(320 65% 60%),hsl(360 75% 62%))";
</script>

{#if mounted}
  <div class="mk-pop {show ? 'on' : ''}" data-focus="popover">
    <div class="mk-pop-scroll">
      <div class="mk-fold-head">
        {#if has("presets")}<ChevronDown size={15} strokeWidth={1.75} />{:else}<ChevronRight
            size={15}
            strokeWidth={1.75}
          />{/if}
        <b>Presets</b><span>{preset}</span>
        <span class="mk-sbtn"><Plus size={15} strokeWidth={1.75} /></span>
      </div>
      {#if has("presets")}
        <div class="mk-presets">
          {#each PRESETS as id (id)}
            {@const t = THEMES[id]}
            <div class="mk-preset {theme.id === id ? 'sel' : ''}">
              <div class="mk-preset-card" style="--p:{t.paper};--i:{t.ink}">
                <i class="h"></i><i></i><i></i><i class="s"></i>
              </div>
              <span>{t.name}</span>
            </div>
          {/each}
        </div>
      {/if}
      <div class="mk-fold-head">
        {#if has("colour")}<ChevronDown size={15} strokeWidth={1.75} />{:else}<ChevronRight
            size={15}
            strokeWidth={1.75}
          />{/if}
        <b>Mode & colour</b><span
          >{theme.base} · {theme.strength ? theme.hue + "°" : "no tint"}</span
        >
      </div>
      {#if has("colour")}
        <div class="mk-fold-body">
          <div class="mk-seg c4">
            <i class="mk-seg-pick" style="transform: translateX({modeIdx * 100}%)"></i>
            {#each MODES as { label, icon: I } (label)}
              <span class={label === theme.base ? "on" : ""}
                ><I size={14} strokeWidth={1.75} />{label}</span
              >
            {/each}
          </div>
          <div class="mk-slider">
            <div class="mk-slider-top"><span>Hue</span><span>{theme.hue}°</span></div>
            <div class="mk-track" style="background:{RAINBOW}">
              <i class="mk-thumb" style="left:{(theme.hue / 360) * 100}%"></i>
            </div>
          </div>
          <div class="mk-slider">
            <div class="mk-slider-top"><span>Strength</span><span>{theme.strength * 2}%</span></div>
            <div class="mk-track">
              <i class="mk-track-fill" style="width:{theme.strength * 2}%"></i><i
                class="mk-thumb"
                style="left:{theme.strength * 2}%"
              ></i>
            </div>
          </div>
        </div>
      {/if}
      <div class="mk-fold-head">
        {#if has("texture")}<ChevronDown size={15} strokeWidth={1.75} />{:else}<ChevronRight
            size={15}
            strokeWidth={1.75}
          />{/if}
        <b>Page texture</b><span>{theme.texture === "none" ? "None" : "Real paper · 85%"}</span>
      </div>
      {#if has("texture")}
        <div class="mk-fold-body">
          <div class="mk-seg c3">
            {#each TEXTURES as tname, i (tname)}
              {@const on =
                (theme.texture === "none" && i === 0) || (theme.texture === "paper" && i === 1)}
              <span class={on ? "on pick" : ""}>{tname}</span>
            {/each}
          </div>
          {#if theme.texture !== "none"}
            <div class="mk-slider">
              <div class="mk-slider-top"><span>Opacity</span><span>85%</span></div>
              <div class="mk-track">
                <i class="mk-track-fill" style="width:85%"></i><i class="mk-thumb" style="left:85%"
                ></i>
              </div>
            </div>
            <div class="mk-slider">
              <div class="mk-slider-top"><span>Scale</span><span>110%</span></div>
              <div class="mk-track">
                <i class="mk-track-fill" style="width:{((110 - 25) / 375) * 100}%"></i><i
                  class="mk-thumb"
                  style="left:{((110 - 25) / 375) * 100}%"
                ></i>
              </div>
            </div>
          {/if}
        </div>
      {/if}
      <div class="mk-fold-head">
        <ChevronRight size={15} strokeWidth={1.75} /><b>Film grain</b><span>{grain}</span>
      </div>
    </div>
    {#if split}
      <div class="mk-pop-foot" data-focus="switches">
        <div class="mk-switch-row">
          <div>
            <b>Theme per pane</b><small>Each pane keeps its own colour; grain stays shared.</small>
          </div>
          <span class="mk-switch {perPane ? 'on' : ''}"><i></i></span>
        </div>
        <div class="mk-switch-row">
          <div>
            <b>Texture per pane</b><small>Each pane keeps its own texture and dials.</small>
          </div>
          <span class="mk-switch"><i></i></span>
        </div>
      </div>
    {/if}
  </div>
{/if}
