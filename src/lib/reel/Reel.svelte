<script lang="ts">
  import Icon from "$lib/icons/Icon.svelte";
  import Download from "$lib/icons/lively/Download.svelte";
  import { ChevronDown } from "$lib/icons/nodes";
  import type { Site } from "$lib/looks";
  import { OS_LABEL } from "$lib/site/downloads";
  import { router } from "$lib/site/router.svelte";
  import { platform } from "$lib/utils/platform.svelte";
  import Shot from "./Shot.svelte";
  import { SHOTS } from "./shots";

  let { site }: { site: Site } = $props();

  const GH = "https://github.com/codewiththiha/mareader";
  const hero = SHOTS[0];

  let portrait = $state(false);
  let active = $state(0);

  $effect(() => {
    const mq = window.matchMedia("(max-width: 819px)");
    const read = () => {
      portrait = mq.matches;
    };
    read();
    mq.addEventListener("change", read);
    return () => {
      mq.removeEventListener("change", read);
    };
  });

  const jump = (i: number) => {
    const el = document.getElementById(`shot-${SHOTS[i].id}`);
    if (!el) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  };

  const seen = (i: number) => {
    active = i;
  };
</script>

{#snippet lead()}
  <p class="shot-kicker">{hero.kicker}</p>
  <h1 class="shot-t hero-t">{hero.title}</h1>
  <p class="shot-b hero-b">{hero.body}</p>
  <div class="shot-cta">
    <a class="btn btn-accent" href={router.href("download")}>
      <Download />
      Download for {OS_LABEL[platform.os]}
    </a>
    <a class="btn btn-ghost" href={GH} rel="noopener noreferrer">View on GitHub</a>
  </div>
  <a class="reel-cue" href="#tour">
    <span class="reel-cue-bob"><Icon node={ChevronDown} size={15} strokeWidth={2.2} ariaHidden /></span>
    <span>Scroll — nine takes, nothing to press</span>
  </a>
{/snippet}

<section id="tour" class="reel" class:portrait aria-label="A reel of the app">
  <nav class="reel-rail" aria-label="Reel chapters">
    {#each SHOTS as s, i (s.id)}
      <button
        type="button"
        class="reel-tick"
        class:on={active === i}
        onclick={() => {
          jump(i);
        }}
        aria-current={active === i ? "true" : undefined}
        aria-label={i === 0 ? "Back to the start of the reel" : `Jump to ${s.kicker}`}
      >
        <span></span>
      </button>
    {/each}
  </nav>

  {#each SHOTS as shot, i (shot.id)}
    <Shot {shot} index={i} {site} {portrait} onSeen={seen} lead={shot.hero ? lead : undefined} />
  {/each}

  <p class="reel-end">
    <span>End of the reel.</span>
    <button
      type="button"
      class="reel-top"
      onclick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}>Back to the top ↑</button
    >
  </p>
</section>
