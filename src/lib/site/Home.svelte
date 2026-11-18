<script lang="ts">
  import Icon from "$lib/icons/Icon.svelte";
  import { BookA, Cpu, ScrollText, type IconNode } from "$lib/icons/nodes";
  import { DEFAULT_STATE, type WinState } from "$lib/window/state";
  import { OS_LABEL } from "$lib/site/downloads";
  import { router } from "$lib/site/router.svelte";
  import { theme } from "$lib/site/theme.svelte";
  import { platform } from "$lib/utils/platform.svelte";
  import Get from "./Get.svelte";
  import More from "./More.svelte";
  import ScaledWindow from "./ScaledWindow.svelte";

  const st = (patch: Partial<WinState>): WinState => ({ ...DEFAULT_STATE, ...patch });

  const HERO: WinState = st({ panes: 4 });

  interface Feature {
    id: string;
    chapter: string;
    title: string;
    body: string;
    details: string[];
    label: string;
    state: WinState;
  }

  const FEATURES: Feature[] = [
    {
      id: "appearance",
      chapter: "Make it yours",
      title: "Limitless themes.",
      body: "Tint it, texture it, add grain. Find a look you love and save it as your own, for PDF and EPUB alike.",
      details: ["Presets & custom colours", "PDF + EPUB"],
      label: "The appearance studio, open on a sepia page.",
      state: st({
        titlebar: true,
        popover: "themes",
        preset: "sepia",
        looks: ["sepia", "sepia", "sepia", "sepia"],
        chrome: "sepia",
      }),
    },
    {
      id: "panes",
      chapter: "Make room",
      title: "More books, more room.",
      body: "Read side by side in up to four panes. Keep the same look throughout, or give each pane its own.",
      details: ["Up to four panes", "Per-pane themes"],
      label: "Four reading panes, each with its own look.",
      state: st({ panes: 4, looks: ["home", "night", "green", "rose"] }),
    },
    {
      id: "dictionary",
      chapter: "Stay in the story",
      title: "A dictionary that reads the page.",
      body: "Select a word and discover its meaning in context, without breaking the flow. Bring the model you trust.",
      details: ["Context-aware", "Your choice of model"],
      label: "A dictionary card explaining a selected word in place.",
      state: st({ marks: true, card: true }),
    },
    {
      id: "models",
      chapter: "Your models, your rules",
      title: "Bring your own model.",
      body: "Use Ollama, LM Studio or Apple's on-device models. Prefer a cloud provider? Bring your own keys and let the rotator handle the rest.",
      details: ["Local models", "Key rotation"],
      label: "AI model settings with local and cloud providers.",
      state: st({ settings: "keys" }),
    },
    {
      id: "voice",
      chapter: "Listen a little longer",
      title: "Read aloud, fully offline.",
      body: "Download a voice once, then listen anywhere. Follow along as Mareader highlights the words for you.",
      details: ["Offline voices", "Read-along highlighting"],
      label: "A read-aloud player with highlighted words on the page.",
      state: st({ settings: "voices", voice: "ready", player: true, pride: "ch6", titlebar: true }),
    },
  ];

  const FACTS: [IconNode, string, string][] = [
    [Cpu, "Light on your machine", "A native app, not a webview. Pages render in a fraction of the memory browser-based readers need."],
    [BookA, "Open what you own", "PDF and EPUB, with shelves, watched folders, search, gloss cards and highlights built in."],
    [ScrollText, "Free and open source", "MIT licensed. No account, no subscription. Your library stays on your disk."],
  ];

  let root = $state<HTMLElement | null>(null);

  $effect(() => {
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of els) io.observe(el);
    return () => {
      io.disconnect();
    };
  });
</script>

// Home — main's simple page, main2's look, live windows

<div bind:this={root}>
  <section class="home-hero" aria-labelledby="hero-title">
    <div class="wrap hero-inner">
      <div class="hero-copy">
        <h1 id="hero-title">Read the way <span>your eyes like.</span></h1>
        <p class="hero-description">A calm reader for PDF and EPUB, with themes, panes, AI and voices that bend to you.</p>
        <div class="hero-actions">
          <a href={router.href("download")} class="btn btn-accent">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              ><path d="M12 3.5v10" /><path d="m7.5 9.5 4.5 4.5 4.5-4.5" /><path
                d="M4.5 16.5v2.2a1.8 1.8 0 0 0 1.8 1.8h11.4a1.8 1.8 0 0 0 1.8-1.8v-2.2"
              /></svg
            >
            Download for {OS_LABEL[platform.os]}
          </a>
          <a href={router.href("download")} class="btn btn-ghost">
            Other systems
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg
            >
          </a>
        </div>
        <p class="hero-footnote">Free &amp; open source <span>·</span> Made for desktop</p>
      </div>
      <div class="hero-visual">
        <ScaledWindow st={HERO} site={theme.current} label="Four reading panes open in Mareader, showing books and PDFs." />
      </div>
    </div>
  </section>

  <section class="showcase" id="features" aria-labelledby="features-title">
    <div class="wrap">
      <header class="showcase-heading reveal">
        <h2 id="features-title">Good reading lives in the details.</h2>
      </header>
      {#each FEATURES as feature, index (feature.id)}
        <article class="feature-row reveal" class:reverse={index % 2 === 0}>
          <div class="feature-copy">
            <div class="feature-kicker">
              <span class="feature-number">{String(index + 1).padStart(2, "0")}</span>
              <span class="feature-kicker-line"></span>
              <span>{feature.chapter}</span>
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
            <ul class="feature-details" aria-label="Highlights">
              {#each feature.details as detail (detail)}
                <li>{detail}</li>
              {/each}
            </ul>
          </div>
          <div class="feature-visual">
            <ScaledWindow st={feature.state} site={theme.current} label={feature.label} />
          </div>
        </article>
      {/each}
    </div>
  </section>

  <section class="pitch">
    <div class="wrap">
      <div class="reveal pitch-head">
        <h2 class="pitch-h">Made for the long read.</h2>
        <p class="pitch-p">
          A native reader built to stay out of your way, with your books close at hand and the page taking centre stage.
        </p>
      </div>
      <div class="reveal facts">
        {#each FACTS as [node, title, body] (title)}
          <div class="fact">
            <div class="fact-top" aria-hidden="true">
              <span class="fact-ico"><Icon {node} size={22} strokeWidth={1.6} /></span>
            </div>
            <h3 class="fact-h">{title}</h3>
            <p class="fact-p">{body}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <Get />
  <More />
</div>
