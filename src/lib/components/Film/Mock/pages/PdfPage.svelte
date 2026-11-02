<script lang="ts">
  // PdfPage — fixed two-column paper
  let { variant, focusName }: { variant: "a" | "b"; focusName?: string } = $props();
  const PAPER_TEXT: [string, string][] = [
    ["1  Introduction","Long-form reading is a fragile habit. A session that begins in the afternoon can dissolve within minutes when the page is too bright, the line too long, or the margins too tight. We study how readers shape their own pages over months of use."],
    ["","Across 214 readers, the settings that changed most were not typography but colour: a warmer paper at night, a quieter ink by day, and a texture that kept the page from feeling like a screen."],
    ["2  Method","Participants read at least one book a week for eight weeks using Mareader, switching themes as they wished. Every theme change and session length was logged locally."],
    ["","Sessions were counted from the first page turn to ten minutes of inactivity. Themes were grouped by base mode and tint hue, and compared within each reader to remove differences between people."],
    ["3  Results","Median session length rose from 24 to 41 minutes once a reader settled on a personal theme. Readers who kept two or more books open also reported fewer interruptions to look things up."],
    ["","The effect held for scanned papers as well as reflowed books, suggesting that the page itself, rather than the format, carries the comfort."]
  ];
  let bars = $derived(variant === "a" ? [38, 52, 47, 66, 74, 88] : [60, 44, 58, 36, 70, 50]);
</script>

<div class="mk-pdf" data-focus={focusName}>
  <div class="mk-pdf-sheet">
    <div class="mk-pdf-title">{variant === "a" ? "Settling In: How Readers Make a Page Their Own" : "A Quiet Interface for Long Sessions"}</div>
    <div class="mk-pdf-auth">E. Marlowe &nbsp;·&nbsp; J. Okafor &nbsp;·&nbsp; R. Lindqvist</div>
    <div class="mk-pdf-abs"><b>Abstract.</b> We follow readers as they tune colour, paper and layout, and ask which choices make a long session easier to start and harder to leave.</div>
    <div class="mk-pdf-cols">
      {#each PAPER_TEXT.slice(0,3) as [h,t]}
        <div>
          {#if h}<h4>{h}</h4>{/if}
          <p>{t}</p>
        </div>
      {/each}
      <figure>
        <svg viewBox="0 0 200 78" width="100%" aria-hidden="true">
          <g stroke="currentColor" stroke-opacity=".35" stroke-width=".6">
            <line x1="12" y1="62" x2="196" y2="62" />
            <line x1="12" y1="8" x2="12" y2="62" />
          </g>
          {#if variant === "a"}
            {#each bars as b, i}
              <rect x={22 + i * 29} y={62 - b * 0.55} width="18" height={b * 0.55} fill={i > 2 ? "var(--accent)" : "currentColor"} fill-opacity={i > 2 ? 0.9 : 0.55} />
            {/each}
          {:else}
            <polyline fill="none" stroke="var(--accent)" stroke-width="1.6" points={bars.map((b,i)=>`${22 + i * 32},${62 - b * 0.7}`).join(" ")} />
            <polyline fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="1.2" points={bars.map((b,i)=>`${22 + i * 32},${62 - (100 - b) * 0.5}`).join(" ")} />
          {/if}
        </svg>
        <figcaption>Figure 1. Median minutes per session, before and after a theme is chosen.</figcaption>
      </figure>
      {#each PAPER_TEXT.slice(3) as [h,t]}
        <div>
          {#if h}<h4>{h}</h4>{/if}
          <p>{t}</p>
        </div>
      {/each}
    </div>
  </div>
</div>
