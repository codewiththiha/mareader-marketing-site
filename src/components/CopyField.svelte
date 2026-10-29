<script lang="ts">
  /**
   * An address you cannot retype: one press copies it, and the button becomes a
   * check that says so. No toast, no floating bubble — the state change is the
   * feedback and it happens where the finger already is.
   */
  import { copyText } from '../lib/clipboard';
  import Icon from './icons/Icon.svelte';

  interface Props {
    value: string;
    /** What is being copied, for the screen-reader announcement. */
    what: string;
  }

  let { value, what }: Props = $props();
  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function press(): Promise<void> {
    const done = await copyText(value);
    copied = done;
    clearTimeout(timer);
    timer = setTimeout(() => (copied = false), 2200);
  }
</script>

<button
  type="button"
  class="copy"
  class:copied
  onclick={press}
  aria-label={copied ? `${what} copied` : `Copy ${what}`}
>
  <span class="copy__value mono">{value}</span>
  <span class="copy__mark" aria-hidden="true">
    <Icon name={copied ? 'check' : 'copy'} size={16} />
  </span>
  <span class="visually-hidden" aria-live="polite">{copied ? `${what} copied` : ''}</span>
</button>

<style>
  .copy {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.6rem 0.65rem 0.6rem 0.8rem;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    background: var(--paper);
    text-align: left;
    transition:
      border-color var(--dur-1) var(--ease),
      background-color var(--dur-1) var(--ease);
  }

  .copy:hover {
    border-color: var(--line-strong);
    background: var(--paper-sink);
  }

  .copy__value {
    flex: 1;
    font-size: 0.76rem;
    line-height: 1.35;
    color: var(--ink-soft);
    overflow-wrap: anywhere;
    letter-spacing: -0.005em;
  }

  .copy__mark {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    flex: none;
    border-radius: 5px;
    color: var(--ink-muted);
    transition: color var(--dur-1) var(--ease);
  }

  .copy:hover .copy__mark {
    color: var(--ink);
  }

  .copy.copied {
    border-color: var(--accent-line);
    background: var(--accent-wash);
  }

  .copy.copied .copy__mark {
    color: var(--accent);
  }
</style>
