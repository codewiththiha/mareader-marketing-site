<script lang="ts">
  import { theme } from '../lib/theme.svelte';

  /** One switch, two states, and a disc that travels between them. */
  const dark = $derived(theme.resolved === 'dark');
</script>

<button
  class="toggle"
  type="button"
  aria-pressed={dark}
  aria-label={dark ? 'Switch to the light theme' : 'Switch to the dark theme'}
  title={dark ? 'Paper' : 'Ink'}
  onclick={() => theme.toggle()}
>
  <span class="track" aria-hidden="true">
    <span class="disc" class:dark>
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
        <circle class="sun" cx="8" cy="8" r="3.1" stroke="currentColor" stroke-width="1.5" />
        <g class="rays" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <path
            d="M8 1.4v1.6M8 13v1.6M14.6 8H13M3 8H1.4M12.7 3.3l-1.1 1.1M4.4 11.6l-1.1 1.1M12.7 12.7l-1.1-1.1M4.4 4.4 3.3 3.3"
          />
        </g>
        <path
          class="moon"
          d="M11.4 9.9A4.6 4.6 0 0 1 6.1 4a4.7 4.7 0 1 0 5.3 5.9Z"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </span>
</button>

<style>
  .toggle {
    display: inline-flex;
    align-items: center;
    padding: 0;
    border-radius: 999px;
  }

  .track {
    position: relative;
    display: block;
    width: 52px;
    height: 30px;
    border-radius: 999px;
    border: 1px solid var(--line-strong);
    background: var(--paper-sink);
    transition:
      background-color var(--dur-2) var(--ease),
      border-color var(--dur-2) var(--ease);
  }

  .disc {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: var(--gilt);
    background: var(--paper-raised);
    box-shadow: var(--shadow-sm);
    transition:
      transform var(--dur-2) var(--ease),
      color var(--dur-2) var(--ease);
  }

  .disc.dark {
    transform: translateX(22px);
    color: var(--accent);
  }

  .sun {
    transition: opacity var(--dur-1) var(--ease);
  }

  .rays {
    transition: opacity var(--dur-1) var(--ease);
    opacity: 1;
  }

  .moon {
    opacity: 0;
    transition: opacity var(--dur-1) var(--ease);
  }

  .disc.dark .sun,
  .disc.dark .rays {
    opacity: 0;
  }

  .disc.dark .moon {
    opacity: 1;
  }

  .toggle:hover .track {
    border-color: var(--ink-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .disc,
    .track,
    .sun,
    .rays,
    .moon {
      transition: none;
    }
  }
</style>
