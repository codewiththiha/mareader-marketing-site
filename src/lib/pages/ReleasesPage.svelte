<script lang="ts">
  import { RELEASES } from "$lib/site/releases";
  import { mdBlocks, type Inline } from "$lib/utils/md";

  const GH = "https://github.com/codewiththiha/mareader2/releases";
  const mb = (n: number) => `${(n / 1048576).toFixed(1)} MB`;
  const installers = (names: { name: string; size: number; url: string }[]) =>
    names.filter((a) => /\.(dmg|exe|msi|deb|AppImage|tar\.gz)$/.test(a.name));
</script>

{#snippet inlines(list: Inline[])}
  {#each list as inl, i (i)}
    {#if inl.k === "b"}
      <strong>{inl.text}</strong>
    {:else if inl.k === "c"}
      <code>{inl.text}</code>
    {:else if inl.k === "a"}
      <a href={inl.href} rel="noopener noreferrer">{inl.text}</a>
    {:else}
      {inl.text}
    {/if}
  {/each}
{/snippet}

<div class="route-page">
  <header class="route-head">
    <p class="eyebrow">Release notes</p>
    <h1 class="serif">What changed, and why it reads better.</h1>
    <p class="route-sub">Every version, straight from the build. The newest first.</p>
  </header>

  {#each RELEASES as release, i (release.tag)}
    <article class="rel" style="--i:{i}">
      <div class="rel-head">
        <span class="rel-pill">{release.tag}</span>
        <span class="rel-date">{release.published}</span>
      </div>
      <div class="md-body">
        {#each mdBlocks(release.body) as block, bi (bi)}
          {#if block.k === "h3"}
            <h3>{@render inlines(block.inlines)}</h3>
          {:else if block.k === "h4"}
            <h4>{@render inlines(block.inlines)}</h4>
          {:else if block.k === "ul"}
            <ul>
              {#each block.items ?? [] as item, ii (ii)}
                <li>{@render inlines(item)}</li>
              {/each}
            </ul>
          {:else}
            <p>{@render inlines(block.inlines)}</p>
          {/if}
        {/each}
      </div>
      {#if installers(release.assets).length}
        <div class="rel-files">
          {#each installers(release.assets) as a (a.name)}
            <a class="file-chip" href={a.url} rel="noopener noreferrer">
              <span>{a.name.replace(/_\d+\.\d+\.\d+/, "")}</span>
              <small>{mb(a.size)}</small>
            </a>
          {/each}
        </div>
      {/if}
    </article>
  {/each}

  <p class="route-more"><a href={GH} rel="noopener noreferrer">All releases on GitHub →</a></p>
</div>
