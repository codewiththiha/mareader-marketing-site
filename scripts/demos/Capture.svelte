<script lang="ts">
  import { onMount } from "svelte";
  import MockWindow from "../../src/lib/components/Film/Mock/MockWindow.svelte";
  import { SCENES, type Scene } from "../../src/lib/scenes";

  const params = new URLSearchParams(location.search);
  const view = params.get("view") ?? "full";
  const dark = params.get("dark") === "1";
  const compact = params.get("size") === "compact";
  const W = compact ? 1024 : 1280;
  const H = compact ? 768 : 800;
  const frames: Record<string, string> = {
    full: "translate(0px, 0px) scale(1)",
    appearance: "translate(-180px, 0px) scale(1.15)",
    dictionary: "translate(-205px, -115px) scale(1.32)",
    settings: "translate(-150px, -95px) scale(1.24)",
    voice: "translate(-85px, -104px) scale(1.13)"
  };
  const themeScene = (theme: string): Scene => ({
    ...SCENES[1],
    id: `appearance-${theme}`,
    themes: [theme],
    popover: { theme, open: ["presets", "colour"] }
  });
  const extra: Record<string, Scene> = {
    hero: {
      ...SCENES[7],
      id: "hero",
      themes: dark ? ["night", "cinema", "dark", "dusk"] : ["sepia", "light", "ocean", "parchment"],
      bar: true
    },
    "appearance-sepia": themeScene("sepia"),
    "appearance-green": themeScene("green"),
    "appearance-night": themeScene("night"),
    "appearance-parchment": themeScene("parchment"),
    "dictionary-base": { ...SCENES[8], id: "dictionary-base", ai: undefined },
    "panes-two": { ...SCENES[4], bar: true },
    "panes-four": { ...SCENES[5], bar: true },
    "panes-own": { ...SCENES[7], bar: true }
  };

  let id = $state(params.get("scene") ?? "hero");
  let scene = $derived(extra[id] ?? SCENES.find((s) => s.id === id) ?? SCENES[0]);
  let cursor = $state({ x: 0, y: 0, visible: false, pressed: false });

  onMount(() => {
    const changeScene = (event: Event) => (id = (event as CustomEvent<string>).detail);
    const moveCursor = (event: Event) => {
      cursor = { ...cursor, ...(event as CustomEvent<Partial<typeof cursor>>).detail };
    };
    window.addEventListener("capture-scene", changeScene);
    window.addEventListener("capture-cursor", moveCursor);
    return () => {
      window.removeEventListener("capture-scene", changeScene);
      window.removeEventListener("capture-cursor", moveCursor);
    };
  });
</script>

<div
  class="capture-stage"
  class:room-for-titlebar={id === "hero" || id.startsWith("panes-")}
  style:width="{W}px"
  style:height="{H}px"
>
  <div class="capture-window" style:transform={frames[view] ?? frames.full}>
    <MockWindow {scene} siteDark={dark} {W} {H} />
  </div>
  <div
    class="capture-cursor {cursor.visible ? 'visible' : ''} {cursor.pressed ? 'pressed' : ''}"
    style:transform="translate({cursor.x}px, {cursor.y}px)"
  >
    <span></span>
    <svg width="24" height="30" viewBox="0 0 24 30" aria-hidden="true">
      <path d="M2 1.8v20.5l5.5-5.1 4.1 9.1 4-1.8-4.1-9.1 7.3-.9L2 1.8Z" />
    </svg>
  </div>
</div>

<style>
  .capture-stage {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: #f7f4ed;
  }
  .room-for-titlebar :global(.mk-panes) {
    top: 48px;
  }
  .capture-window {
    position: absolute;
    inset: 0;
    transform-origin: 0 0;
  }
  .capture-window :global(.mk-window) {
    border-radius: 0;
    box-shadow: none;
  }
  .capture-cursor {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 100;
    opacity: 0;
    pointer-events: none;
    transition:
      transform 0.45s cubic-bezier(0.3, 0.7, 0.1, 1),
      opacity 0.2s;
    filter: drop-shadow(0 2px 2px rgb(0 0 0 / 0.22));
  }
  .capture-cursor.visible {
    opacity: 1;
  }
  .capture-cursor svg {
    position: relative;
    fill: #1b1b1b;
    stroke: white;
    stroke-width: 1.8;
    stroke-linejoin: round;
  }
  .capture-cursor span {
    position: absolute;
    width: 35px;
    height: 35px;
    left: -15px;
    top: -15px;
    border: 2px solid #b87b28;
    border-radius: 50%;
    opacity: 0;
    transform: scale(0.45);
    transition:
      opacity 0.2s,
      transform 0.3s;
  }
  .capture-cursor.pressed span {
    opacity: 0.65;
    transform: scale(1);
  }
</style>
