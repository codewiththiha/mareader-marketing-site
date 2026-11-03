<!-- Two quiet cards linking the release notes and support routes. -->
<script lang="ts">
  import Heart from "$lib/icons/lively/Heart.svelte";
  import { router } from "$lib/site/router.svelte";
  import { latestTag } from "$lib/site/downloads";

  const cards = [
    {
      route: "releases" as const,
      kicker: "Release notes",
      title: `See what changed in ${latestTag}`,
      body: "Every build, its highlights, and checksums — kept short and honest.",
      cta: "Read the notes",
    },
    {
      route: "donate" as const,
      kicker: "Support",
      title: "Keep Mareader free",
      body: "Crypto from anywhere, local ways from Myanmar. Every bit keeps the lights on.",
      cta: "Ways to give",
    },
  ];
</script>

<section class="mx-auto max-w-[1080px] px-6 pb-24">
  <div class="grid gap-4 sm:grid-cols-2">
    {#each cards as card (card.route)}
      <a href={router.href(card.route)} class="more-card group">
        <span class="more-kicker">{card.kicker}</span>
        <h3 class="serif more-title">{card.title}</h3>
        <p class="more-body">{card.body}</p>
        <span class="more-cta">
          {#if card.route === "donate"}<Heart />{/if}
          {card.cta}
          <span class="more-arrow" aria-hidden="true">→</span>
        </span>
      </a>
    {/each}
  </div>
</section>

<style>
  .more-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 26px 28px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: color-mix(in srgb, var(--ink) 2.6%, transparent);
    transition:
      transform 0.25s var(--e-pane),
      border-color 0.25s ease,
      background-color 0.25s ease;
  }
  .more-card:hover {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
    background: color-mix(in srgb, var(--ink) 4.5%, transparent);
  }
  .more-kicker {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .more-title {
    font-size: 22px;
    font-weight: 560;
    line-height: 1.2;
    letter-spacing: -0.01em;
    color: var(--ink);
  }
  .more-body {
    font-size: 14.5px;
    line-height: 1.6;
    color: var(--muted);
  }
  .more-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 14px;
    font-weight: 550;
    color: var(--ink);
  }
  .more-arrow {
    transition: transform 0.25s var(--e-pane);
  }
  .more-card:hover .more-arrow {
    transform: translateX(4px);
  }
</style>
