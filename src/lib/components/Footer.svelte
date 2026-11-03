<script lang="ts">
  // Footer — the quiet end of the page
  import Logo from "./Logo.svelte";
  import { href } from "@/lib/router.svelte";
  import { RELEASES, REPO } from "@/lib/constants";
</script>

<footer class="ftr">
  <div class="ftr-in">
    <div class="ftr-brand">
      <Logo size={20} />
      <span>Mareader · MIT licensed</span>
    </div>
    <nav class="ftr-links" aria-label="Footer">
      <a href={href("releases")}>Release notes</a>
      <a href={href("support")}>Support</a>
      <a href={REPO}>GitHub</a>
      <a href={RELEASES}>Downloads</a>
    </nav>
  </div>
</footer>
