<script lang="ts">
  import { reveal } from '../../lib/reveal';
  import Link from '../Link.svelte';
  import Icon from '../icons/Icon.svelte';
</script>

<section class="section" aria-labelledby="donate-heading">
  <div class="wrap">
    <div class="card" use:reveal>
      <div class="card__text">
        <h2 class="heading card__heading" id="donate-heading">If it earns a place in your day.</h2>
        <p class="body card__body">
          Mareader is free and MIT licensed, made by one person between releases. Donations pay for
          the signing certificates that would end the first-launch warnings, and for the time the
          next version takes.
        </p>
      </div>
      <Link href="/donate" class="btn strip__cta">
        <span>Ways to give</span>
        <Icon name="arrow-right" size={16} />
      </Link>
    </div>
  </div>
</section>

<style>
  /* One bordered card: the words and their button belong in the same box. */
  .card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-6);
    padding: clamp(20px, 3vw, 32px) clamp(20px, 3vw, 34px);
    border: 1px solid var(--line);
    border-radius: var(--r-md);
    background: var(--paper-sink);
  }

  .card__heading {
    font-size: var(--text-xl);
    margin-bottom: 0.4em;
  }

  .card__body {
    max-width: 52ch;
    font-size: var(--text-base);
  }

  :global(.strip__cta) {
    flex: none;
  }

  :global(.strip__cta svg) {
    transition: transform var(--dur-2) var(--ease);
  }

  :global(.strip__cta:hover svg) {
    transform: translateX(3px);
  }

  @media (max-width: 720px) {
    .card {
      flex-direction: column;
      align-items: flex-start;
    }

    :global(.strip__cta) {
      width: 100%;
    }
  }
</style>
