<script lang="ts">
  import { onMount } from "svelte";
  import { releaseUrl } from "$lib/site/downloads";
  import { notesLead, releaseNotes } from "$lib/site/release-notes";
  import { GH, releases } from "$lib/site/releases-live.svelte";

  onMount(() => {
    void releases.refresh();
  });

  const list = $derived(releases.all);
  const latest = $derived(list[0]?.tag ?? "");
  let folded = $state<Record<string, boolean>>({});
  const shown = (tag: string) => folded[tag] ?? tag === latest;
  const toggle = (tag: string) => {
    folded[tag] = !shown(tag);
  };
</script>

<div class="route-page rel-page">
  <header class="route-head">
    <p class="eyebrow">Release notes</p>
    <h1 class="serif">What changed, and why it reads better.</h1>
    <p class="route-sub">
      The summary of every release, read straight from GitHub{releases.live
        ? ""
        : " — the newest build checks for fresher notes when it can"}. Open one for its highlights, then take the full notes from GitHub.
    </p>
  </header>

  {#each list as release, i (release.tag)}
    {@const open = shown(release.tag)}
    {@const lead = notesLead(release.body)}
    <article class="rel" class:open style="--i:{i}">
      <h2 class="rel-h">
        <button
          type="button"
          class="rel-head"
          aria-expanded={open}
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
          {#if lead}<p class="rel-lead">{lead}</p>{/if}
          {#each releaseNotes(release.body) as sec, si (si)}
            <h4 class="rel-sec">{sec.title}</h4>
            <ul class="rel-points">
              {#each sec.items as point, pi (pi)}
                <li>
                  {#if point.lead}<strong>{point.lead}</strong>&nbsp;{/if}{point.rest}
                </li>
              {/each}
            </ul>
          {/each}
          <p class="rel-full">
            <a href={releaseUrl(release.tag)} rel="noopener noreferrer">Read the full notes for {release.tag} on GitHub →</a>
          </p>
        </div>
      </div>
    </article>
  {/each}

  <p class="route-more"><a href="{GH}/releases" rel="noopener noreferrer">All releases, files and checksums on GitHub →</a></p>
</div>
