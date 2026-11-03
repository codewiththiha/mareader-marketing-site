<script lang="ts">
  import Window from "$lib/window/Window.svelte";
  import { bakeList, stateOf } from "$lib/film/steps";

  const params = new URLSearchParams(location.search);
  const list = bakeList();
  const item = list.find((x) => x.key === params.get("bake"));

  $effect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    (window as unknown as { __BAKE__: unknown }).__BAKE__ = list;
    const done = () => window.setTimeout(() => (document.body.dataset.ready = "1"), 700);
    const fonts = document.fonts as FontFaceSet | undefined;
    if (fonts) void fonts.ready.then(done);
    else done();
  });

  $effect(() => {
    if (item) document.documentElement.dataset.theme = item.site;
  });
</script>

{#if item}
  <div id="bake-root" style="position: absolute; left: 0; top: 0; width: 1536px; height: 960px; border-radius: 14px; overflow: hidden">
    <Window st={stateOf(item.step, item.frame)} site={item.site} active={false} bake />
  </div>
{/if}
