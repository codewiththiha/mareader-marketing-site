<script lang="ts">
  // Footer — minimal links
  import Logo from "./Logo.svelte";
  import { RELEASES, REPO } from "@/lib/constants";
</script>

<footer class="border-t border-[var(--hair)] px-5 py-8 sm:px-10">
  <div class="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-3 text-[13px] text-[var(--fg2)] sm:flex-row">
    <div class="flex items-center gap-2.5">
      <Logo size={20} />
      <span>Mareader · MIT licensed</span>
    </div>
    <div class="flex gap-5">
      <a href={REPO} class="hover:text-[var(--fg)]">GitHub</a>
      <a href={RELEASES} class="hover:text-[var(--fg)]">Releases</a>
    </div>
  </div>
</footer>
