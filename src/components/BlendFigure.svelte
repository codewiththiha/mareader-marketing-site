<script lang="ts">
  /**
   * The backdrop, on its own: no bar, no rail, because nothing else is being
   * shown. Off, the window keeps its own colour and the page sits on it; on, the
   * backdrop takes the page's colour and the page loses its edges into it.
   * `paper.blend` in crates/settings/src/reader.rs.
   */
  import { windowPalette, type Mode, type Tint } from '../lib/appearance';

  interface Props {
    /** The page's colour, spread into the window behind it. */
    blended: boolean;
    mode?: Mode;
    tint?: Tint;
  }

  let { blended, mode = 'light', tint = 'none' }: Props = $props();

  const palette = $derived(windowPalette(mode, tint));
</script>

<div
  class="frame"
  class:frame--blended={blended}
  style:--paper={palette.page}
  style:--chrome={palette.chrome}
  style:--ink={palette.ink}
  style:--rule={palette.rule}
  aria-hidden="true"
>
  <div class="page">
    <span class="page__head"></span>
    <span class="page__rule"></span>
    <span class="line"></span>
    <span class="line"></span>
    <span class="line line--short"></span>
    <span class="line"></span>
    <span class="line line--short"></span>
  </div>
</div>

<style>
  /* Only a backdrop and a page: the two things the switch changes. */
  .frame {
    display: grid;
    place-items: center;
    height: 168px;
    padding: 18px;
    border: 1px solid var(--line);
    border-radius: var(--r-md);
    background: var(--chrome);
    transition: background-color var(--dur-3) var(--ease);
  }

  /* On, the window behind the page is the page's own colour. */
  .frame--blended {
    background: var(--paper);
  }

  .page {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: min(58%, 220px);
    height: 100%;
    padding: 14px 16px;
    background: var(--paper);
    border-radius: 2px;
    box-shadow:
      0 1px 2px rgb(0 0 0 / 0.1),
      0 6px 18px rgb(0 0 0 / 0.09);
    transition:
      background-color var(--dur-3) var(--ease),
      box-shadow var(--dur-3) var(--ease);
  }

  /* Blended, the page stops being a sheet lying on a surface. */
  .frame--blended .page {
    box-shadow: none;
  }

  .page__head {
    width: 58%;
    height: 7px;
    border-radius: 2px;
    background: color-mix(in oklab, var(--ink) 82%, var(--paper));
  }

  .page__rule {
    width: 40%;
    height: 2px;
    margin-bottom: 2px;
    background: var(--rule);
  }

  .line {
    height: 3px;
    border-radius: 2px;
    background: color-mix(in oklab, var(--ink) 62%, var(--paper));
  }

  .line--short {
    width: 72%;
  }

  @media (prefers-reduced-motion: reduce) {
    .frame,
    .page {
      transition: none;
    }
  }
</style>
