<script lang="ts">
  import { router } from "$lib/site/router.svelte";
  import icon from "../../assets/icon.png";

  const GH = "https://github.com/codewiththiha/mareader2";
  const year = new Date().getFullYear();

  const toTop = (e: Event) => {
    e.preventDefault();
    if (router.current !== "home") router.go("home");
    window.scrollTo({ top: 0 });
  };
</script>

<footer class="site-foot">
  <div class="foot-grid">
    <div class="foot-brand">
      <div class="foot-logo">
        <img src={icon} alt="" width={22} height={22} />
        <span>Mareader</span>
      </div>
      <p>Free and open source. No account, no subscription — just your books, the way you like to read them.</p>
    </div>
    <nav aria-label="Product">
      <h4>Product</h4>
      <a href={router.href("download")} aria-current={router.current === "download" ? "page" : undefined}>Download</a>
      <a href={router.href("releases")} aria-current={router.current === "releases" ? "page" : undefined}>Release notes</a>
      <a href={router.href("donate")} aria-current={router.current === "donate" ? "page" : undefined}>Support</a>
    </nav>
    <nav aria-label="Project">
      <h4>Project</h4>
      <a href={GH} rel="noopener noreferrer">Source on GitHub</a>
      <a href="{GH}/issues" rel="noopener noreferrer">Report an issue</a>
      <a href="#/" onclick={toTop}>Back to top</a>
    </nav>
  </div>
  <div class="foot-base">
    <span>© {year} Mareader · MIT licensed</span>
    <span>Made for readers, everywhere.</span>
  </div>
</footer>

<style>
  .site-foot {
    border-top: 1px solid var(--line);
  }
  .foot-grid {
    max-width: 1080px;
    margin: 0 auto;
    padding: 44px 24px 30px;
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: 32px;
  }
  .foot-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
  }
  .foot-logo img {
    width: 22px;
    height: 22px;
    border-radius: 6px;
  }
  .foot-brand p {
    margin-top: 12px;
    max-width: 36ch;
    font-size: 13.5px;
    line-height: 1.65;
    color: var(--muted);
  }
  .foot-grid nav h4 {
    margin: 2px 0 10px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .foot-grid nav a {
    display: block;
    padding: 4px 0;
    font-size: 14px;
    color: color-mix(in srgb, var(--ink) 82%, var(--muted));
    transition: color 0.2s ease;
  }
  .foot-grid nav a:hover {
    color: var(--ink);
  }
  .foot-grid nav a[aria-current="page"] {
    color: var(--ink);
    font-weight: 550;
  }
  .foot-base {
    max-width: 1080px;
    margin: 0 auto;
    padding: 16px 24px 30px;
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
    font-size: 12.5px;
    color: var(--muted);
  }
  @media (max-width: 720px) {
    .foot-grid {
      grid-template-columns: 1fr 1fr;
      gap: 26px;
    }
    .foot-brand {
      grid-column: 1 / -1;
    }
  }
</style>
