<script lang="ts">
  import { router } from "$lib/site/router.svelte";
  import icon from "../../assets/icon.png";

  const GH = "https://github.com/codewiththiha/mareader2";
</script>

<footer
  class="mx-auto flex max-w-[1080px] flex-col items-center justify-between gap-3 border-t border-[var(--line)] px-6 py-8 text-[13.5px] text-[var(--muted)] sm:flex-row"
>
  <div class="flex items-center gap-2.5">
    <img src={icon} alt="" width={20} height={20} class="h-5 w-5 rounded-[5px]" />
    <span>Mareader · MIT licensed</span>
  </div>
  <div class="flex items-center gap-5">
    <a href={router.href("releases")} class="hover:text-[var(--ink)]">Release notes</a>
    <a href={router.href("donate")} class="hover:text-[var(--ink)]">Support</a>
    <a href={GH} class="hover:text-[var(--ink)]">Source</a>
  </div>
</footer>
