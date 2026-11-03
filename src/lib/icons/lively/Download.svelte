<script lang="ts">
  // tray glyph
</script>

<!-- Download arrow that settles into its tray when the button is hovered. -->
<svg
  viewBox="0 0 24 24"
  width="20"
  height="20"
  fill="none"
  stroke="currentColor"
  stroke-width="1.9"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <g class="lv-dip">
    <path d="M12 3.5v10" />
    <path d="m7.5 9.5 4.5 4.5 4.5-4.5" />
  </g>
  <path d="M4.5 16.5v2.2a1.8 1.8 0 0 0 1.8 1.8h11.4a1.8 1.8 0 0 0 1.8-1.8v-2.2" />
</svg>

<style>
  :global(.btn:hover) .lv-dip,
  :global(.btn:focus-visible) .lv-dip {
    animation: lv-dip 0.7s var(--e-pane);
  }
  @keyframes lv-dip {
    45% {
      transform: translateY(2.6px);
    }
  }
  .lv-dip {
    transform-origin: 12px 9px;
  }
</style>
