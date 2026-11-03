<script lang="ts">
  // SupportTeaser — one quiet line before the footer
  import { Heart } from "@lucide/svelte";
  import { href } from "@/lib/router.svelte";
  import { reveal } from "@/lib/actions/reveal.svelte";
</script>

<div use:reveal class="reveal teaser">
  <Heart size={15} strokeWidth={1.8} class="teaser-heart" />
  <p>
    One person, MIT licensed, no ads. If Mareader earns its place on your machine,
    <a href={href("support")}>keep it going</a>.
  </p>
</div>
