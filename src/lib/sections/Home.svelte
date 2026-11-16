<script lang="ts">
  import { ArrowDown, ArrowDownRight, Download } from "@lucide/svelte";
  import FeaturePreview from "@/lib/components/Preview/FeaturePreview.svelte";
  import { PREVIEWS, previewAsset } from "@/lib/previews";
  import { useTheme } from "@/lib/stores/theme.svelte";
  import { platform } from "@/lib/platform.svelte";
  import { bestFor, OS_LABEL } from "@/lib/downloads";
  import { href } from "@/lib/router.svelte";
  import Facts from "./Facts.svelte";
  import DownloadSection from "./DownloadSection.svelte";
  import SupportTeaser from "./SupportTeaser.svelte";
  import { reveal } from "@/lib/actions/reveal.svelte";

  const theme = useTheme();
  let heroBest = $derived(platform.mobile ? null : bestFor(platform.os, platform.arch));

  function explore() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("features")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }
</script>

<section class="home-hero" aria-labelledby="hero-title">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="home-eyebrow"><span class="eyebrow-dot"></span>A LITTLE MORE ROOM TO READ</p>
      <h1 id="hero-title">Read the way your eyes like.</h1>
      <p class="hero-description">
        A calm reader for PDF and EPUB, with themes, panes, AI and voices that bend to you.
      </p>
      <div class="hero-actions">
        <a
          href={heroBest ? heroBest.asset.url : href("releases")}
          class="btn-primary"
          data-testid="hero-dl"
        >
          <Download size={17} strokeWidth={2} />
          {heroBest ? `Download for ${OS_LABEL[heroBest.os]}` : "Download free"}
        </a>
        <a href={href("releases")} class="btn-ghost">Other systems <ArrowDownRight size={15} /></a>
      </div>
      <p class="hero-footnote">Free &amp; open source <span>·</span> Made for desktop</p>
      <button class="scroll-cue" type="button" onclick={explore}>
        <span class="scroll-cue-icon"><ArrowDown size={16} strokeWidth={1.8} /></span>
        <span><strong>Take a look around</strong><small>Scroll to explore</small></span>
      </button>
    </div>
    <div class="hero-art">
      <div class="hero-art-top"><span>YOUR SPACE TO READ</span><span>01 / 05</span></div>
      <div class="hero-window">
        <img
          src={previewAsset(theme.dark ? "hero-dark.jpg" : "hero-light.jpg")}
          width="1024"
          height="640"
          alt="A book open in the Mareader desktop app."
          fetchpriority="high"
        />
      </div>
      <div class="hero-art-bottom">
        <span>PDF &amp; EPUB</span><span>MADE FOR THE LONG READ</span>
      </div>
    </div>
  </div>
</section>

<section class="showcase" id="features" aria-labelledby="features-title">
  <div class="wrap">
    <header class="showcase-heading">
      <div>
        <p class="home-eyebrow"><span class="eyebrow-dot"></span>A CLOSER LOOK</p>
        <h2 id="features-title">Good reading lives in the details.</h2>
      </div>
      <p>Scroll at your own pace. Each little preview starts when you arrive.</p>
    </header>
    {#each PREVIEWS as preview, index (preview.id)}
      <article class="feature-row" class:reverse={index % 2 === 1}>
        <div class="feature-copy">
          <div class="feature-kicker">
            <span class="feature-number">{String(index + 1).padStart(2, "0")}</span>
            <span class="feature-kicker-line"></span>
            <span>{preview.chapter}</span>
          </div>
          <h3>{preview.title}</h3>
          <p>{preview.body}</p>
          <ul class="feature-details" aria-label="Highlights">
            {#each preview.details as detail (detail)}
              <li>{detail}</li>
            {/each}
          </ul>
        </div>
        <FeaturePreview {preview} number={index + 1} />
      </article>
    {/each}
  </div>
</section>

<section class="pitch">
  <div class="wrap">
    <div use:reveal class="reveal pitch-head">
      <h2 class="pitch-h">Made for the long read.</h2>
      <p class="pitch-p">
        A native reader built to stay out of your way, with your books close at hand and the page
        taking centre stage.
      </p>
    </div>
    <Facts />
    <DownloadSection />
    <SupportTeaser />
  </div>
</section>
