<!-- Home: the reading desk up top, then five live previews, then the ask. -->
<script lang="ts">
  import Download from "$lib/icons/lively/Download.svelte";
  import Heart from "$lib/icons/lively/Heart.svelte";
  import Icon from "$lib/icons/Icon.svelte";
  import { ArrowDownRight, BookA, Cpu, Scale, type IconNode } from "$lib/icons/nodes";
  import PreviewStage from "$lib/site/PreviewStage.svelte";
  import { HERO, PREVIEWS } from "$lib/site/previews";
  import { latestTag, OS_LABEL, releaseUrl } from "$lib/site/downloads";
  import { router } from "$lib/site/router.svelte";
  import { theme } from "$lib/site/theme.svelte";
  import { reveal } from "$lib/utils/reveal.svelte";
  import { platform } from "$lib/utils/platform.svelte";
  import icon from "../../assets/icon.png";

  const FACTS: [IconNode, string, string][] = [
    [Cpu, "Light on your machine", "A native app, not a webview. Pages render in a fraction of the memory browser readers need."],
    [BookA, "Open what you own", "PDF and EPUB, with shelves, watched folders, search, gloss cards and highlights built in."],
    [Scale, "Free and open source", "MIT licensed. No account, no subscription. Your library stays on your disk."],
  ];

  const toFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const site = $derived(theme.current);
  const ask = $derived(`Download for ${OS_LABEL[platform.os]}`);
</script>

<section class="hm-hero">
  <div class="hm-sky" aria-hidden="true"></div>
  <div class="hm-wrap hm-hero-in">
    <div class="hm-hero-copy">
      <p class="hm-eyebrow"><span class="hm-pip"></span> Mareader &middot; PDF and EPUB, offline</p>
      <h1 class="serif">Read the way <em>your eyes like.</em></h1>
      <p class="hm-lede">A calm reader for PDF and EPUB, with themes, panes, AI and voices that bend to you.</p>
      <div class="hm-actions">
        <a class="btn btn-accent" href={router.href("download")}><Download />{ask}</a>
        <a class="btn btn-ghost" href={router.href("download")} aria-label="See every download">
          Other systems
          <Icon node={ArrowDownRight} size={16} strokeWidth={1.9} ariaHidden />
        </a>
      </div>
      <p class="hm-note">Free &amp; open source <span>&middot;</span> {latestTag} <span>&middot;</span> Made for desktop</p>
    </div>
    <figure class="hm-hero-art" use:reveal>
      <PreviewStage id="hero" frames={HERO.frames} rect={HERO.rect} {site} poster={HERO.poster} />
      <figcaption class="sr-only">Four books open side by side in Mareader, each pane wearing its own look.</figcaption>
    </figure>
  </div>
  <button type="button" class="hm-down" aria-label="Jump to the features" onclick={toFeatures}>
    <span class="hm-down-line"></span>
  </button>
</section>

<section class="hm-show" id="features">
  <div class="hm-wrap">
    <header class="hm-show-head" use:reveal>
      <h2 class="serif">Good reading lives in the details.</h2>
      <p>Everything below is the app itself, running live in your browser &mdash; not a recording.</p>
    </header>
    {#each PREVIEWS as p, i (p.id)}
      <article class="hm-row" class:flip={i % 2 === 0} use:reveal>
        <div class="hm-row-copy">
          <p class="hm-kicker">
            <span class="hm-num">{String(i + 1).padStart(2, "0")}</span>
            <span class="hm-rule"></span>
            {p.chapter}
          </p>
          <h3 class="serif">{p.title}</h3>
          <p class="hm-body">{p.body}</p>
          <ul class="hm-chips">
            {#each p.details as d (d)}<li>{d}</li>{/each}
          </ul>
        </div>
        <figure class="hm-row-art">
          <PreviewStage id={p.id} frames={p.frames} rect={p.rect} {site} poster={p.poster} />
          <figcaption class="sr-only">{p.alt}</figcaption>
        </figure>
      </article>
    {/each}
  </div>
</section>

<section class="hm-pitch">
  <div class="hm-wrap">
    <header class="hm-pitch-head" use:reveal>
      <h2 class="serif">Made for the long read.</h2>
      <p>A native reader built to stay out of your way, with your books close at hand and the page taking centre stage.</p>
    </header>

    <div class="hm-facts" use:reveal>
      {#each FACTS as [node, title, body], i (title)}
        <div class="hm-fact">
          <div class="hm-fact-top">
            <span class="hm-fact-ico"><Icon {node} size={21} strokeWidth={1.6} ariaHidden /></span>
            <span class="hm-fact-num">{String(i + 1).padStart(2, "0")}</span>
          </div>
          <h3>{title}</h3>
          <p>{body}</p>
        </div>
      {/each}
    </div>

    <div class="hm-cta" id="download" use:reveal>
      <div class="hm-cta-copy">
        <img src={icon} alt="" width={72} height={72} />
        <h3 class="serif">Pick up where you left off.</h3>
        <p>Free forever. No account, no tracker, no cloud.</p>
      </div>
      <div class="hm-cta-do">
        <a class="btn btn-accent" href={router.href("download")}><Download />{ask}</a>
        <p class="hm-cta-sub">
          {latestTag}
          <span>&middot;</span>
          <a href={router.href("releases")}>what&rsquo;s new</a>
          <span>&middot;</span>
          <a href={releaseUrl()} rel="noopener noreferrer">checksums</a>
        </p>
      </div>
    </div>

    <p class="hm-teaser" use:reveal>
      <Heart />
      One person, MIT licensed, no ads. If Mareader earns its place on your machine,
      <a href={router.href("donate")}>keep it going</a>.
    </p>
  </div>
</section>
