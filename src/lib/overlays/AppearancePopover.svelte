<script lang="ts">
  import { Eclipse, Moon, Plus, Sun, SunMoon } from "@lucide/svelte";
  import { HUES, PRESETS, hueSwatch, tokensOf, type Appearance, type Base, type Noise, type Texture } from "@/lib/palette";
  import { styles } from "@/lib/style";
  import IconButton from "@/lib/window/IconButton.svelte";
  import Sep from "@/lib/overlays/Sep.svelte";
  import FoldHeader from "@/lib/overlays/FoldHeader.svelte";
  import PresetCard from "@/lib/overlays/PresetCard.svelte";
  import Row from "@/lib/overlays/Row.svelte";
  import Segments from "@/lib/overlays/Segments.svelte";
  import Slider from "@/lib/overlays/Slider.svelte";
  import Switch from "@/lib/overlays/Switch.svelte";

  const POPOVER_W = 320;
  const stack = styles({ gap: 6, marginTop: 2 });

  const MODES: { id: Base; label: string; icon: typeof Sun }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "dim", label: "Dim", icon: SunMoon },
    { id: "black", label: "Black", icon: Eclipse },
  ];
  const TEXTURES: { id: Texture; label: string }[] = [
    { id: "none", label: "None" },
    { id: "paper", label: "Real paper" },
    { id: "lined", label: "Lined" },
    { id: "grid", label: "Grid" },
    { id: "dotted", label: "Dotted" },
    { id: "cross", label: "Cross" },
  ];
  const NOISES: { id: Noise; label: string }[] = [
    { id: "off", label: "Off" },
    { id: "static", label: "Static" },
    { id: "animated", label: "Animated" },
  ];

  let {
    look,
    split,
    pressing = null,
  }: {
    look: Appearance;
    split?: { themes: boolean; textures: boolean } | null;
    pressing?: string | null;
  } = $props();

  const dark = $derived(tokensOf(look).dark);
  const selected = $derived(PRESETS.find((p) => JSON.stringify(p.look) === JSON.stringify(look))?.id);
  const pct = $derived(Math.round(Math.min(100, (look.strength / 50) * 100)));
  const hueName = $derived(HUES.find(([h]) => h === Math.round(look.hue))?.[1]);
  const hueP = $derived(((((look.hue % 360) + 360) % 360) / 360) * 100);
  const showTextureDials = $derived(look.texture !== "none");
  const showGrainDial = $derived(look.noise !== "off");
</script>

<div
  data-focus="popover"
  class="absolute z-40 flex flex-col"
  style={styles({
    top: 52,
    right: 8,
    width: POPOVER_W,
    padding: 10,
    borderRadius: 12,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    boxShadow: "0 8px 24px var(--shadow)",
    animation: "rise-in 0.22s var(--ease-out-quint) both",
  })}
>
  <FoldHeader title="Presets" open>
    {#snippet trailing()}
      <IconButton icon={Plus} size={20} iconSize={13} focus="save-look" />
    {/snippet}
  </FoldHeader>
  <div class="flex" style={styles({ gap: 6, marginTop: 2 })}>
    {#each PRESETS as p (p.id)}
      <PresetCard id={p.id} name={p.name} look={p.look} selected={selected === p.id} pressed={pressing === p.id} />
    {/each}
  </div>
  <Sep />
  <div data-focus="colour-group">
    <FoldHeader title="Mode & colour" open />
    <div class="flex flex-col" style={stack}>
      <Segments value={look.base} options={MODES} focus="mode" />
      <div data-focus="hue">
        <Row name="Hue">
          <div
            class="relative flex-1"
            style={styles({
              height: 20,
              borderRadius: 10,
              background: "linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)",
              opacity: dark ? 0.85 : 1,
            })}
          >
            <span
              class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={styles({
                left: `${hueP}%`,
                width: 16,
                height: 16,
                background: hueSwatch(look.hue, dark),
                boxShadow: "0 0 0 2px #fff, 0 1px 3px rgba(0,0,0,.4)",
                transition: "left 0.12s linear",
              })}
            ></span>
          </div>
          <span style={styles({ width: 52, fontSize: 11, textAlign: "center", color: "var(--muted)" })}
            >{hueName ?? `${Math.round(look.hue)}°`}</span
          >
        </Row>
        <div class="flex items-center" style={styles({ gap: 8, marginTop: 6, paddingLeft: 72 })}>
          {#each HUES as [h] (h)}
            <span
              class="rounded-full"
              style={styles({
                width: 20,
                height: 20,
                background: hueSwatch(h, dark),
                boxShadow:
                  Math.round(look.hue) === h && look.strength > 0
                    ? "0 0 0 2px var(--surface), 0 0 0 4px var(--accent)"
                    : "inset 0 0 0 1px rgba(0,0,0,.08)",
                transition: "box-shadow 0.2s",
              })}
            ></span>
          {/each}
        </div>
      </div>
      <Row name="Strength">
        <Slider value={pct} min={0} max={100} shown={`${pct}%`} focus="strength" />
      </Row>
    </div>
  </div>
  <Sep />
  <FoldHeader title="Text" open={false} summary="17 pt · 1.6 × · Literata" />
  <Sep />
  <div data-focus="texture-group">
    <FoldHeader title="Page texture" open />
    <div class="flex flex-col" style={stack}>
      <Segments value={look.texture} options={TEXTURES} focus="texture" />
      {#if showTextureDials}
        <Row name="Opacity">
          <Slider value={look.textureOpacity} min={0} max={100} shown={`${look.textureOpacity}%`} />
        </Row>
        <Row name="Scale">
          <Slider value={look.textureScale} min={25} max={400} shown={`${look.textureScale}%`} />
        </Row>
      {/if}
    </div>
  </div>
  <Sep />
  <div data-focus="grain-group">
    <FoldHeader title="Film grain" open />
    <div class="flex flex-col" style={stack}>
      <Segments value={look.noise} options={NOISES} focus="grain" />
      {#if showGrainDial}
        <Row name="Intensity">
          <Slider value={look.noiseIntensity} min={0} max={100} shown={`${look.noiseIntensity}%`} />
        </Row>
      {/if}
    </div>
  </div>
  {#if split}
    <Sep />
    <div data-focus="split-view" style={styles({ padding: "2px 2px 0" })}>
      <div style={styles({ fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 6 })}>Split view</div>
      <div class="flex items-start justify-between" style={styles({ gap: 12 })}>
        <div>
          <div style={styles({ fontSize: 13 })}>Theme per pane</div>
          <div style={styles({ fontSize: 11, color: "var(--muted)" })}>Each pane keeps its own colour; grain stays shared.</div>
        </div>
        <Switch on={split.themes} focus="theme-per-pane" />
      </div>
      <div class="mt-2 flex items-start justify-between" style={styles({ gap: 12 })}>
        <div>
          <div style={styles({ fontSize: 13 })}>Texture per pane</div>
          <div style={styles({ fontSize: 11, color: "var(--muted)" })}>Each pane keeps its own texture and dials.</div>
        </div>
        <Switch on={split.textures} />
      </div>
    </div>
  {/if}
</div>
