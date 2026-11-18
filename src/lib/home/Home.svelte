<script lang="ts">
  import Preview from "./Preview.svelte";
  import Details from "$lib/site/Details.svelte";
  import Get from "$lib/site/Get.svelte";
  import More from "$lib/site/More.svelte";
  import Download from "$lib/icons/lively/Download.svelte";
  import { router } from "$lib/site/router.svelte";
  import { theme } from "$lib/site/theme.svelte";

  const previews = [
    {
      chapter: "Make it yours",
      title: "Limitless themes.",
      body: "Tint it, texture it, add grain. Find a look you love and save it as your own, for PDF and EPUB alike.",
      details: ["Presets & custom colours", "PDF + EPUB"],
      label: "Mareader's appearance settings beside a book page.",
      step: 1,
      frames: [2, 3, 4, 5],
      focus: { x: 800, y: 0, w: 736, h: 650 },
    },
    {
      chapter: "Make room",
      title: "More books, more room.",
      body: "Read side by side in up to four panes. Keep the same look throughout, or give each pane its own.",
      details: ["Up to four panes", "Per-pane themes"],
      label: "Four reading panes showing different books and page themes.",
      step: 4,
      frames: [5],
    },
    {
      chapter: "Stay in the story",
      title: "A dictionary that reads the page.",
      body: "Select a word and discover its meaning in context, without breaking the flow. Bring the model you trust.",
      details: ["Context-aware", "Your choice of model"],
      label: "A contextual dictionary card explaining a selected word in a book.",
      step: 5,
      frames: [2],
      focus: { x: 750, y: 140, w: 786, h: 600 },
    },
    {
      chapter: "Your models, your rules",
      title: "Bring your own model.",
      body: "Use Ollama, LM Studio or Apple's on-device models. Prefer a cloud provider? Bring your own keys and let the rotator handle the rest.",
      details: ["Local models", "Key rotation"],
      label: "Mareader's AI model settings with local and cloud model providers.",
      step: 7,
      frames: [0],
      focus: { x: 480, y: 90, w: 820, h: 600 },
    },
    {
      chapter: "Listen a little longer",
      title: "Read aloud, fully offline.",
      body: "Download a voice once, then listen anywhere. Follow along as Mareader highlights the words for you.",
      details: ["Offline voices", "Read-along highlighting"],
      label: "A read-aloud player and highlighted words on a book page.",
      step: 8,
      frames: [0],
      focus: { x: 450, y: 120, w: 1086, h: 740 },
    },
  ];
</script>

<section class="home-hero" aria-labelledby="hero-title">
  <div class="home-wrap hero-inner">
    <div class="hero-copy">
      <h1 id="hero-title">Read the way <span>your eyes like.</span></h1>
      <p class="hero-description">A calm reader for PDF and EPUB, with themes, panes, AI and voices that bend to you.</p>
      <div class="hero-actions">
        <a href={router.href("download")} class="btn btn-accent"><Download /> Download free</a>
        <a href={router.href("download")} class="home-other">Other systems <span aria-hidden="true">↘</span></a>
      </div>
      <p class="hero-footnote">Free &amp; open source <span>·</span> Made for desktop</p>
    </div>
    <Preview site={theme.current} step={4} frames={[5]} label="Four reading panes open in Mareader, showing books and PDFs." />
  </div>
</section>

<section class="showcase" id="features" aria-labelledby="features-title">
  <div class="home-wrap">
    <header class="showcase-heading"><h2 id="features-title">Good reading lives in the details.</h2></header>
    {#each previews as preview, index (preview.chapter)}
      <article class="feature-row" class:reverse={index % 2 === 0}>
        <div class="feature-copy">
          <div class="feature-kicker">
            <span>{String(index + 1).padStart(2, "0")}</span><span class="feature-kicker-line"></span><span>{preview.chapter}</span>
          </div>
          <h3>{preview.title}</h3>
          <p>{preview.body}</p>
          <ul class="feature-details" aria-label="Highlights">
            {#each preview.details as detail (detail)}<li>{detail}</li>{/each}
          </ul>
        </div>
        <Preview site={theme.current} step={preview.step} frames={preview.frames} label={preview.label} focus={preview.focus} />
      </article>
    {/each}
  </div>
</section>
<section class="home-pitch home-wrap">
  <h2>Made for the long read.</h2>
  <p>A native reader built to stay out of your way, with your books close at hand and the page taking centre stage.</p>
</section>
<Details />
<Get />
<More />
