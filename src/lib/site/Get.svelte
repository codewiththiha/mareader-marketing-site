<script lang="ts">
  import icon from "../../assets/icon.png";

  const GH = "https://github.com/codewiththiha/mareader2";
  const RELEASES = `${GH}/releases/latest`;
</script>

<section id="download" class="mx-auto flex max-w-[760px] scroll-mt-16 flex-col items-center px-6 pb-28 pt-10 text-center">
  <img src={icon} alt="" width={84} height={84} class="h-[84px] w-[84px]" />
  <h2 class="serif mt-7 text-[clamp(32px,4.4vw,54px)] font-[540] leading-[1.06] tracking-[-0.02em]">Free, open source, and yours.</h2>
  <p class="mt-4 max-w-[40ch] text-[17px] leading-[1.55] text-[var(--muted)]">
    No account, no subscription. Just your books, the way you like to read them.
  </p>
  <div class="mt-8 flex flex-wrap justify-center gap-3">
    <a href={RELEASES} class="btn btn-accent">Download for macOS</a>
    <a href={RELEASES} class="btn btn-ghost">Windows</a>
    <a href={RELEASES} class="btn btn-ghost">Linux</a>
  </div>
  <p class="mt-6 max-w-[52ch] text-[13px] leading-[1.6] text-[var(--muted)]">
    The macOS build isn’t notarized yet. If macOS stops it, choose Open Anyway in System Settings › Privacy &amp; Security.
  </p>
</section>
