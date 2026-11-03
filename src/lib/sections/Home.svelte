<script lang="ts">
  // Home — the film, the pitch, the facts, the download
  import Film from "@/lib/components/Film/Film.svelte";
  import Facts from "./Facts.svelte";
  import DownloadSection from "./DownloadSection.svelte";
  import SupportTeaser from "./SupportTeaser.svelte";
  import { reveal } from "@/lib/actions/reveal.svelte";
</script>

<Film />
<section class="pitch">
  <div class="wrap">
    <div use:reveal class="reveal pitch-head">
      <h2 class="pitch-h">Made for the long read.</h2>
      <p class="pitch-p">
        Everything you saw runs on your machine, quietly, so the book is the only thing asking for
        attention.
      </p>
    </div>
    <Facts />
    <DownloadSection />
    <SupportTeaser />
  </div>
</section>
