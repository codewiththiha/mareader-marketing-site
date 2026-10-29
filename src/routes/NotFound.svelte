<script lang="ts">
  import Link from '../components/Link.svelte';
</script>

<div class="wrap missing">
  <p class="label">404</p>
  <h1 class="display">This page was never printed.</h1>
  <p class="lede">
    The address may be old, or a release may have moved. The three pages below exist.
  </p>
  <div class="missing__links">
    <Link href="/" class="btn btn--primary">Overview</Link>
    <Link href="/releases" class="btn">Release notes</Link>
    <Link href="/donate" class="btn">Donate</Link>
  </div>
</div>

<style>
  .missing {
    padding-block: clamp(64px, 12vw, 160px);
    min-height: 60vh;
  }

  .missing .label {
    margin-bottom: var(--sp-3);
  }

  .missing .lede {
    margin-top: var(--sp-4);
  }

  .missing__links {
    display: flex;
    gap: var(--sp-3);
    flex-wrap: wrap;
    margin-top: var(--sp-6);
  }
</style>
