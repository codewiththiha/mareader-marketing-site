<script lang="ts">
  import RichText from "./RichText.svelte";
  import { rich } from "./rich";
  import { P13A, P13B, P14 } from "./texts";

  let { chunk }: { chunk: number } = $props();

  const PW = 612;
  const PH = 792;
  const left = $derived(P13A.concat(P13B).map((t) => rich(t)));
  const leftA = $derived(left.slice(0, P13A.length));
  const leftB = $derived(left.slice(P13A.length));

  interface ChunkPara {
    chunks: { text: string; lead: boolean; idx: number }[] | null;
    tokens: ReturnType<typeof rich> | null;
  }
  const right = $derived.by(() => {
    let ci = 0;
    return P14.map((p): ChunkPara => {
      if (typeof p === "string") return { chunks: null, tokens: rich(p) };
      return {
        tokens: null,
        chunks: p.map((c) => {
          const idx = ci++;
          return { text: c, lead: c.startsWith(" "), idx };
        }),
      };
    });
  });
</script>

<div class="pdf" style="position: absolute; left: 0; top: 0; width: {PW * 2}px; height: {PH}px">
  <div class="pdf-col" style="left: 92px; top: 82px; width: 429px">
    {#each leftA as t, ti (ti)}
      <p><RichText tokens={t} /></p>
    {/each}
    <div style="text-align: center; font-weight: 700; font-size: 16px; line-height: 20px; margin: 34px 0 16px">Chapter 6</div>
    {#each leftB as t, ti (ti)}
      <p><RichText tokens={t} /></p>
    {/each}
  </div>
  <div class="pdf-col" style="left: {PW + 92}px; top: 82px; width: 429px">
    {#each right as para, pi (pi)}
      <p>
        {#if para.tokens}
          <RichText tokens={para.tokens} />
        {:else}
          {#each para.chunks ?? [] as c (c.idx)}
            {c.lead ? " " : ""}<span class="ch" class:on={c.idx === chunk}
              ><RichText tokens={rich(c.lead ? c.text.slice(1) : c.text)} /></span
            >
          {/each}
        {/if}
      </p>
    {/each}
  </div>
</div>
