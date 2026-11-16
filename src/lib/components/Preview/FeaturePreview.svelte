<script lang="ts">
  import { Repeat2 } from "@lucide/svelte";
  import { viewportLoop } from "@/lib/actions/viewportLoop";
  import { previewAsset, type Preview } from "@/lib/previews";

  let { preview, number }: { preview: Preview; number: number } = $props();
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
  <figcaption class="preview-caption">
    <span
      ><span class="preview-caption-number">{String(number).padStart(2, "0")}</span
      >{preview.frameLabel}</span
    >
    <span class="preview-caption-loop"><Repeat2 size={14} strokeWidth={1.7} /> Silent preview</span>
  </figcaption>
</figure>
