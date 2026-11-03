<script lang="ts">
  import RichText from "./RichText.svelte";
  import { rich } from "./rich";
  import { CH1, GUTENBERG } from "./texts";

  let { marks = false, onSel }: { marks?: boolean; onSel?: (el: HTMLElement) => void } = $props();

  const PW = 612;
  const PH = 792;
  const toks = $derived.by(() => {
    const c = { n: 0 };
    return CH1.map((t) => rich(t, c));
  });
  const cols: [number, number, number, number][] = [
    [1, 21, 216, 93],
    [22, 42, 280, 93],
    [43, 61, 345, 106.8],
  ];
</script>

<div class="pdf" style="position: absolute; left: 0; top: 0; width: {PW * 2}px; height: {PH}px">
  <div style="position: absolute; left: 0; top: 0; width: {PW}px; height: {PH}px">
    <div class="pdf-mono" style="position: absolute; left: 80px; top: 97px; font-size: 10.8px; line-height: 12.6px; white-space: pre">
      {GUTENBERG}
    </div>
    <div
      style="position: absolute; left: 0; width: {PW}px; top: 498px; text-align: center; font-weight: 700; font-size: 23px; line-height: 28.75px"
    >
      PRIDE AND PREJUDICE
    </div>
    <div
      style="position: absolute; left: 0; width: {PW}px; top: 569px; text-align: center; font-weight: 700; font-size: 15.6px; line-height: 19.5px"
    >
      By Jane Austen
    </div>
    <div style="position: absolute; left: 229px; width: 154px; top: 638px; height: 0.9px; background: currentColor; opacity: 0.42"></div>
    <div
      style="position: absolute; left: 0; width: {PW}px; top: 670px; text-align: center; font-weight: 700; font-size: 12.6px; line-height: 15.75px"
    >
      Contents
    </div>
  </div>
  <div style="position: absolute; left: {PW}px; top: 0; width: {PW}px; height: {PH}px">
    {#each cols as [from, to, left, top] (left)}
      <div style="position: absolute; left: {left}px; top: {top}px; font-size: 11.4px; line-height: 13.8px">
        {#each Array.from({ length: to - from + 1 }, (_, i) => from + i) as c (c)}
          <div class="toc">Chapter {c}</div>
        {/each}
      </div>
    {/each}
    <div style="position: absolute; left: 229px; width: 154px; top: 427px; height: 0.9px; background: currentColor; opacity: 0.42"></div>
    <div
      style="position: absolute; left: 0; width: {PW}px; top: 485px; text-align: center; font-weight: 700; font-size: 18px; line-height: 22.5px"
    >
      Chapter 1
    </div>
    <div class="pdf-col" style="left: 85px; top: 520px; width: 444px; font-size: 11.4px; line-height: 13.6px">
      {#each toks as t, ti (ti)}
        <p style:margin-bottom="9.4px">
          <RichText tokens={t} {marks} {onSel} />
        </p>
      {/each}
    </div>
  </div>
</div>
