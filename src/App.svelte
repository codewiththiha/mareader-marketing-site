<script lang="ts">
  // App — main page layout
  import Header from "@/lib/components/Header.svelte";
  import Footer from "@/lib/components/Footer.svelte";
  import Film from "@/lib/components/Film/Film.svelte";
  import Facts from "@/lib/sections/Facts.svelte";
  import Cta from "@/lib/sections/Cta.svelte";
  import { reveal } from "@/lib/actions/reveal.svelte";
  import { useTheme, applyThemeClass } from "@/lib/stores/theme.svelte";
  import { onMount } from "svelte";

  const theme = useTheme();
  let dark = $state(false);

  onMount(() => {
    theme.init();
    dark = theme.dark;
    applyThemeClass(dark);
  });

  $effect(() => {
    dark = theme.dark;
    applyThemeClass(dark);
  });

  function toggle() {
    theme.toggle();
    dark = theme.dark;
  }
</script>

<div class="min-h-screen">
  <Header {dark} onToggle={toggle} />
  <main id="top">
    <Film {dark} />
    <section class="relative px-5 pb-24 pt-20 sm:px-10 sm:pt-28">
      <div class="mx-auto max-w-[1100px]">
        <div use:reveal class="reveal text-center">
          <h2 class="mx-auto max-w-[760px] font-serif text-[32px] font-medium leading-[1.1] tracking-[-0.015em] sm:text-[52px]" style="text-wrap: balance">
            Made for the long read.
          </h2>
          <p class="mx-auto mt-4 max-w-[520px] text-[15.5px] leading-[1.6] text-[var(--fg2)] sm:text-[17px]">
            Everything you saw runs on your machine, quietly, so the book is the only thing asking for attention.
          </p>
        </div>
        <Facts />
        <Cta />
      </div>
    </section>
  </main>
  <Footer />
</div>
