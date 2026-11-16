<script lang="ts">
  import { viewportLoop } from "@/lib/actions/viewportLoop";
  import { previewAsset, type Preview } from "@/lib/previews";

  let { preview }: { preview: Preview } = $props();
</script>

<figure class="preview-card" data-preview={preview.id}>
  <div class="preview-screen">
    <img
      src={previewAsset(`${preview.id}.jpg`)}
      alt={preview.imageAlt}
      width="1024"
      height="640"
      loading="lazy"
      decoding="async"
    />
    <video
      use:viewportLoop={previewAsset(`${preview.id}.mp4`)}
      muted
      playsinline
      loop
      preload="none"
      aria-hidden="true"
      tabindex="-1"
    ></video>
  </div>
  <figcaption class="sr-only">{preview.frameLabel}. Silent, looping preview.</figcaption>
</figure>
