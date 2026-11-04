<script lang="ts">
  import { releaseUrl } from "$lib/site/downloads";
  import { highlightsFor } from "$lib/site/highlights";
  import { RELEASES } from "$lib/site/releases";

  const GH = "https://github.com/codewiththiha/mareader2/releases";
  const latest = RELEASES[0]?.tag ?? "";
  let open = $state<Record<string, boolean>>({ [latest]: true });
  const toggle = (tag: string) => {
    open[tag] = !open[tag];
  };
</script>

<div class="route-page rel-page">
  <header class="route-head">
    <p class="eyebrow">Release notes</p>
    <h1 class="serif">What changed, and why it reads better.</h1>
    <p class="route-sub">The short version of every release, newest first. Each one opens; the full notes live on GitHub.</p>
  </header>

  {#each RELEASES as release, i (release.tag)}
    {@const shown = open[release.tag]}
    <article class="rel" class:open={shown} style="--i:{i}">
      <h2 class="rel-h">
        <button
          type="button"
          class="rel-head"
          aria-expanded={shown}
          aria-controls="fold-{release.tag}"
          onclick={() => {
            toggle(release.tag);
          }}
        >
          <span class="rel-pill">{release.tag}</span>
          <span class="rel-date">{release.published}</span>
          {#if release.tag === latest}<span class="rel-new">Latest</span>{/if}
          <svg class="rel-chev" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path
              d="M4 6.5 8 10.5 12 6.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </h2>
      <div class="rel-fold" id="fold-{release.tag}" role="region" aria-label="{release.tag} highlights">
        <div class="rel-fold-in">
          <ul class="rel-points">
            {#each highlightsFor(release) as h, hi (hi)}
              <li>
                {#if h.lead}<strong>{h.lead}</strong>&nbsp;{/if}{h.rest}
              </li>
            {/each}
          </ul>
          <p class="rel-full">
            <a href={releaseUrl(release.tag)} rel="noopener noreferrer">Full notes for {release.tag} on GitHub →</a>
          </p>
        </div>
      </div>
    </article>
  {/each}

  <p class="route-more"><a href={GH} rel="noopener noreferrer">All releases on GitHub →</a></p>
</div>
