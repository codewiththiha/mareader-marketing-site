<script lang="ts">
  import Icon from "$lib/icons/Icon.svelte";
  import AiMark from "$lib/icons/AiMark.svelte";
  import AiModels from "./AiModels.svelte";
  import ReadAloud from "./ReadAloud.svelte";
  import {
    BookA,
    ChartNoAxesColumnIncreasing,
    Columns2,
    Cpu,
    Headphones,
    Highlighter,
    LayoutTemplate,
    Palette,
    Wind,
    X,
    type IconNode,
  } from "$lib/icons/nodes";

  let {
    page,
    lit,
    voice,
    tick,
    running,
  }: { page: "keys" | "local" | "voices" | null; lit: string | null; voice: "downloading" | "ready"; tick: number; running: boolean } =
    $props();

  const NAV: [string, { name: string; node: IconNode | null }[]][] = [
    [
      "Reading",
      [
        { name: "Appearance", node: Palette },
        { name: "Layout", node: LayoutTemplate },
        { name: "Read aloud", node: Headphones },
      ],
    ],
    [
      "Study",
      [
        { name: "Highlights", node: Highlighter },
        { name: "Vocabulary", node: ChartNoAxesColumnIncreasing },
        { name: "Dictionary", node: BookA },
        { name: "AI", node: null },
      ],
    ],
    [
      "App",
      [
        { name: "AI models", node: Cpu },
        { name: "Panes", node: Columns2 },
        { name: "Motion", node: Wind },
      ],
    ],
  ];

  let last: "keys" | "local" | "voices" = "keys";
  const pg = $derived.by(() => {
    if (page) last = page;
    return page ?? last;
  });
  const sel = $derived(pg === "voices" ? "Read aloud" : "AI models");
</script>

<div class="st-back" class:on={page !== null}></div>
<div class="st" class:on={page !== null}>
  <nav class="st-nav">
    {#each NAV as [group, items] (group)}
      <div>
        <div class="st-ng">{group}</div>
        {#each items as it (it.name)}
          <div class="st-ni" class:sel={it.name === sel}>
            {#if it.node}
              <Icon node={it.node} size={20} ariaHidden />
            {:else}
              <AiMark size={20} />
            {/if}
            <span>{it.name}</span>
          </div>
        {/each}
      </div>
    {/each}
  </nav>
  <div class="st-main">
    <div class="st-head">
      <span>{sel}</span>
      <Icon node={X} size={22} strokeWidth={1.8} ariaHidden />
    </div>
    <div class="st-clip">
      <div class="st-scroll" style:transform={`translateY(${pg === "keys" ? -236 : 0}px)`}>
        {#if pg === "voices"}
          <ReadAloud {voice} running={running && page === "voices"} />
        {:else}
          <AiModels local={pg === "local"} {lit} {tick} />
        {/if}
      </div>
    </div>
  </div>
</div>
