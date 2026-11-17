<script lang="ts">
  import { ArrowDownRight, Download } from "@lucide/svelte";
  import FeaturePreview from "@/lib/components/Preview/FeaturePreview.svelte";
  import { PREVIEWS, previewAsset } from "@/lib/previews";
  import { useTheme } from "@/lib/stores/theme.svelte";
  import { platform } from "@/lib/platform.svelte";
  import { bestFor, OS_LABEL } from "@/lib/downloads";
  import { guideForFile } from "@/lib/releases/assets";
  import { href } from "@/lib/router.svelte";
  import Facts from "./Facts.svelte";
  import DownloadSection from "./DownloadSection.svelte";
  import SupportTeaser from "./SupportTeaser.svelte";
  import { reveal } from "@/lib/actions/reveal.svelte";

  const theme = useTheme();
  let heroBest = $derived(platform.mobile ? null : bestFor(platform.os, platform.arch));
</script>

<section class="home-hero" aria-labelledby="hero-title">
  <div class="wrap hero-inner">
    <div class="hero-copy">
      <h1 id="hero-title">Read the way <span>your eyes like.</span></h1>
      <p class="hero-description">
        A calm reader for PDF and EPUB, with themes, panes, AI and voices that bend to you.
      </p>
      <div class="hero-actions">
        <a
          href={heroBest ? heroBest.asset.url : href("downloads")}
          class="btn-primary"
          data-download-guide={heroBest ? guideForFile(heroBest.asset.name) : undefined}
          data-testid="hero-dl"
        >
          <Download size={17} strokeWidth={2} />
          {heroBest ? `Download for ${OS_LABEL[heroBest.os]}` : "Download free"}
        </a>
        <a href={href("downloads")} class="btn-ghost">
          Other systems <ArrowDownRight size={15} />
        </a>
      </div>
      <p class="hero-footnote">Free &amp; open source <span>·</span> Made for desktop</p>
    </div>
    <div class="hero-visual">
      <picture class="hero-art">
        <source
          media="(max-width: 560px)"
          srcset={previewAsset(theme.dark ? "hero-mobile-dark.jpg" : "hero-mobile-light.jpg")}
        />
        <img
          src={previewAsset(theme.dark ? "hero-dark.jpg" : "hero-light.jpg")}
          width="1024"
          height="640"
          alt="Four reading panes open in Mareader, showing books and PDFs."
          fetchpriority="high"
        />
      </picture>
    </div>
  </div>
</section>

<section class="showcase" id="features" aria-labelledby="features-title">
  <div class="wrap">
    <header class="showcase-heading">
      <h2 id="features-title">Good reading lives in the details.</h2>
    </header>
    {#each PREVIEWS as preview, index (preview.id)}
      <article class="feature-row" class:reverse={index % 2 === 0}>
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
        <FeaturePreview {preview} />
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
