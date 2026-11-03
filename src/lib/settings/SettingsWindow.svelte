<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    BookA,
    ChartNoAxesColumnIncreasing,
    Columns2,
    Cpu,
    Highlighter,
    LayoutTemplate,
    Palette,
    Type,
    Volume2,
    Wind,
    X,
    type LucideIcon,
  } from "@lucide/svelte";
  import { styles } from "@/lib/style";
  import AiMark from "@/lib/overlays/AiMark.svelte";

  interface TabItem {
    id: string;
    name: string;
    icon: "ai" | LucideIcon;
  }

  const TABS: { group: string; items: TabItem[] }[] = [
    {
      group: "Reading",
      items: [
        { id: "layout", name: "Layout", icon: LayoutTemplate },
        { id: "theme", name: "Theme", icon: Palette },
        { id: "fonts", name: "Fonts", icon: Type },
        { id: "read-aloud", name: "Read aloud", icon: Volume2 },
      ],
    },
    {
      group: "Study",
      items: [
        { id: "highlights", name: "Highlights", icon: Highlighter },
        { id: "vocabulary", name: "Vocabulary", icon: ChartNoAxesColumnIncreasing },
        { id: "dictionary", name: "Dictionary", icon: BookA },
        { id: "ai", name: "AI", icon: "ai" },
      ],
    },
    {
      group: "App",
      items: [
        { id: "models", name: "AI models", icon: Cpu },
        { id: "animations", name: "Animations", icon: Wind },
        { id: "workspace", name: "Workspace", icon: Columns2 },
      ],
    },
  ];

  let {
    tab,
    title,
    width,
    height,
    dark,
    children,
  }: {
    tab: string;
    title: string;
    width: number;
    height: number;
    dark: boolean;
    children: Snippet;
  } = $props();

  const shell = $derived(styles({ width: Math.min(820, width - 48), height: Math.min(560, height - 48) }));
</script>

<div
  class="absolute inset-0 z-50 flex items-center justify-center"
  style={styles({ background: dark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.19)", animation: "fade-in 0.2s ease both" })}
>
  <div
    data-focus="settings"
    class="flex overflow-hidden"
    style={styles(
      {
        borderRadius: 12,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "0 8px 24px var(--shadow)",
        animation: "rise-in 0.22s var(--ease-out-quint) both",
      },
      shell,
    )}
  >
    <div class="flex shrink-0 flex-col" style={styles({ width: 188, padding: "14px 8px", borderRight: "1px solid var(--line)" })}>
      {#each TABS as g (g.group)}
        <div style={styles({ marginBottom: 10 })}>
          <div style={styles({ fontSize: 11, fontWeight: 500, color: "var(--muted)", padding: "0 10px 4px" })}>{g.group}</div>
          {#each g.items as it (it.id)}
            {@const Icon = it.icon === "ai" ? null : it.icon}
            <div
              class="flex items-center"
              style={styles({
                height: 30,
                padding: "0 10px",
                gap: 9,
                borderRadius: 8,
                fontSize: 13,
                background: it.id === tab ? "var(--accent-soft)" : "transparent",
                color: it.id === tab ? "var(--accent)" : "var(--ink)",
              })}
            >
              {#if !Icon}
                <AiMark size={16} />
              {:else}
                <Icon size={16} strokeWidth={2} />
              {/if}
              <span>{it.name}</span>
            </div>
          {/each}
        </div>
      {/each}
    </div>
    <div class="relative flex min-w-0 flex-1 flex-col">
      <div class="flex items-center" style={styles({ height: 52, padding: "0 20px", fontSize: 16, fontWeight: 600 })}>
        {title}
        <span class="ml-auto" style={styles({ color: "var(--muted)" })}>
          <X size={16} />
        </span>
      </div>
      <div class="min-h-0 flex-1 overflow-hidden" style={styles({ padding: "0 20px 20px" })}>
        {@render children()}
      </div>
    </div>
  </div>
</div>
