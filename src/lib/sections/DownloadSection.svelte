<script lang="ts">
  // DownloadSection — the closing card: take the app home
  import DownloadPanel from "@/lib/components/DownloadPanel.svelte";
  import { reveal } from "@/lib/actions/reveal.svelte";
</script>

<div use:reveal class="reveal cta-card" id="download">
  <h3 class="cta-h">Pick up where you left off.</h3>
  <p class="cta-p">Free forever. No account, no tracker, no cloud.</p>
  <DownloadPanel />
</div>
