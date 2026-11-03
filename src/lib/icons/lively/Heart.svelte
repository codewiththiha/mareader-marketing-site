<script lang="ts">
  // beat glyph
</script>

<!-- Heart that beats once when its button is hovered, and rests while active. -->
<svg
  viewBox="0 0 24 24"
  width="19"
  height="19"
  fill="none"
  stroke="currentColor"
  stroke-width="1.9"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path
    class="lv-heart"
    d="M12 20.3C8 17 3.5 13.6 3.5 9.6 3.5 6.9 5.6 5 8 5c1.7 0 3.2 1 4 2.4C12.8 6 14.3 5 16 5c2.4 0 4.5 1.9 4.5 4.6 0 4-4.5 7.4-8.5 10.7Z"
  />
</svg>

<style>
  :global(.btn:hover) .lv-heart,
  :global(.btn:focus-visible) .lv-heart,
  :global(.nav-link:hover) .lv-heart {
    animation: lv-beat 0.85s ease;
    transform-origin: 12px 13px;
  }
  @keyframes lv-beat {
    25% {
      transform: scale(1.14);
    }
    45% {
      transform: scale(0.97);
    }
    65% {
      transform: scale(1.08);
    }
  }
</style>
