<script lang="ts">
  import Preview from "./Preview.svelte";
  import type { TimelineId } from "./timelines";
  import Details from "$lib/site/Details.svelte";
  import Get from "$lib/site/Get.svelte";
  import More from "$lib/site/More.svelte";
  import Download from "$lib/icons/lively/Download.svelte";
  import { router } from "$lib/site/router.svelte";
  import { theme } from "$lib/site/theme.svelte";

  const previews: { chapter: string; title: string; body: string; details: string[]; label: string; timeline: TimelineId }[] = [
    {
      chapter: "Make it yours",
      title: "Limitless themes.",
      body: "Tint it, texture it, add grain. Find a look you love and save it as your own, for PDF and EPUB alike.",
      details: ["Presets & custom colours", "PDF + EPUB"],
      label: "Mareader's appearance settings beside a book page.",
      timeline: "appearance",
    },
    {
      chapter: "Make room",
      title: "More books, more room.",
      body: "Read side by side in up to four panes. Keep the same look throughout, or give each pane its own.",
      details: ["Up to four panes", "Per-pane themes"],
      label: "Four reading panes showing different books and page themes.",
      timeline: "panes",
    },
    {
      chapter: "Stay in the story",
      title: "A dictionary that reads the page.",
      body: "Select a word and discover its meaning in context, without breaking the flow. Bring the model you trust.",
      details: ["Context-aware", "Your choice of model"],
      label: "A contextual dictionary card explaining a selected word in a book.",
      timeline: "dictionary",
    },
    {
      chapter: "Your models, your rules",
      title: "Bring your own model.",
      body: "Use Ollama, LM Studio or Apple's on-device models. Prefer a cloud provider? Bring your own keys and let the rotator handle the rest.",
      details: ["Local models", "Key rotation"],
      label: "Mareader's AI model settings with local and cloud model providers.",
      timeline: "models",
    },
    {
      chapter: "Listen a little longer",
      title: "Read aloud, fully offline.",
      body: "Download a voice once, then listen anywhere. Follow along as Mareader highlights the words for you.",
      details: ["Offline voices", "Read-along highlighting"],
      label: "A read-aloud player and highlighted words on a book page.",
      timeline: "voice",
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
    <Preview site={theme.current} timeline="hero" label="Four reading panes open in Mareader, showing books and PDFs." />
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
        <Preview site={theme.current} timeline={preview.timeline} label={preview.label} />
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
