<script lang="ts">
  import icon from "../../assets/icon.png";

  const GH = "https://github.com/codewiththiha/mareader2";
  const RELEASES = `${GH}/releases/latest`;
</script>

<footer
  class="mx-auto flex max-w-[1080px] flex-col items-center justify-between gap-3 border-t border-[var(--line)] px-6 py-8 text-[13.5px] text-[var(--muted)] sm:flex-row"
>
  <div class="flex items-center gap-2.5">
    <img src={icon} alt="" width={20} height={20} class="h-5 w-5 rounded-[5px]" />
    <span>Mareader · MIT licensed</span>
  </div>
  <div class="flex items-center gap-5">
    <a href={RELEASES} class="hover:text-[var(--ink)]">Releases</a>
    <a href={GH} class="hover:text-[var(--ink)]">Source</a>
  </div>
</footer>
