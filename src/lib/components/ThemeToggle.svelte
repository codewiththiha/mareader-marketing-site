<script lang="ts">
  // ThemeToggle — sun and moon morph inside one glyph
  let { dark, onToggle }: { dark: boolean; onToggle: () => void } = $props();
</script>

<button
  type="button"
  class="tt"
  class:dark
  onclick={onToggle}
  aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
  title={dark ? "Light theme" : "Dark theme"}
>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <mask id="tt-cut">
        <rect x="0" y="0" width="24" height="24" fill="white"></rect>
        <circle class="tt-bite" cx="17.2" cy="6.8" r="5.1" fill="black"></circle>
      </mask>
    </defs>
    <g class="tt-rays" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
      <path d="M12 1.8v2.4" />
      <path d="M12 19.8v2.4" />
      <path d="M1.8 12h2.4" />
      <path d="M19.8 12h2.4" />
      <path d="M4.8 4.8 6.5 6.5" />
      <path d="M17.5 17.5 19.2 19.2" />
      <path d="M4.8 19.2 6.5 17.5" />
      <path d="M17.5 6.5 19.2 4.8" />
    </g>
    <circle cx="12" cy="12" r="5.4" fill="currentColor" mask="url(#tt-cut)"></circle>
  </svg>
</button>
