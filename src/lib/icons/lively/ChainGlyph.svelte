<script lang="ts">
  import type { ChainFamily } from "$lib/site/wallets";

  /** One quiet glyph per chain family; it stirs only while its row is chosen. */
  let { family, on = false }: { family: ChainFamily; on?: boolean } = $props();
</script>

<svg
  viewBox="0 0 24 24"
  width="20"
  height="20"
  fill="none"
  stroke="currentColor"
  stroke-width="1.7"
  stroke-linecap="round"
  stroke-linejoin="round"
  class:on
  aria-hidden="true"
>
  {#if family === "evm"}
    <path class="s1" d="M12 3.5 6.8 12 12 15.2 17.2 12Z" />
    <path class="s2" d="M6.8 13.6 12 20.5l5.2-6.9L12 16.9Z" />
  {:else if family === "bitcoin"}
    <path class="s1" d="M9 6.5h4.6a2.6 2.6 0 0 1 0 5.2H9Zm0 5.2h5.2a2.6 2.6 0 0 1 0 5.2H9Z" />
    <path class="s2" d="M9 4.5v2M12.4 4.5v2M9 16.9v2.6M12.4 16.9v2.6" />
  {:else if family === "solana"}
    <path class="s1" d="M7 8.2h10l-2.2 2.3H4.8Z" />
    <path class="s2" d="M7 15.8h10l-2.2-2.3H4.8Z" />
    <path class="s1" d="M7 12h10" opacity="0.45" />
  {:else if family === "tron"}
    <path class="s1" d="m5 6.5 14 3-7 9Z" />
    <path class="s2" d="m5 6.5 7 2.9 7 .1M12 9.4v9.1" opacity="0.6" />
  {:else}
    <path class="s1" d="M12 4v16M4 12h16" />
    <path class="s2" d="m6.5 6.5 11 11M17.5 6.5l-11 11" opacity="0.55" />
  {/if}
</svg>

<style>
  .s1,
  .s2 {
    transition:
      transform 0.4s var(--e-pane),
      opacity 0.3s ease;
    transform-origin: 12px 12px;
  }
  .on .s1 {
    animation: lv-stir 2.6s ease-in-out infinite;
  }
  .on .s2 {
    animation: lv-stir 2.6s ease-in-out 0.2s infinite;
  }
  @keyframes lv-stir {
    50% {
      transform: translateY(-0.7px) scale(1.04);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .on .s1,
    .on .s2 {
      animation: none;
    }
  }
</style>
