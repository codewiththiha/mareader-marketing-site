<script lang="ts">
  import AroundBooks from "@/lib/site/AroundBooks.svelte";
  import Download from "@/lib/site/Download.svelte";
  import Feature from "@/lib/site/Feature.svelte";
  import Footer from "@/lib/site/Footer.svelte";
  import Hero from "@/lib/site/Hero.svelte";
  import Nav from "@/lib/site/Nav.svelte";
  import DictionaryScene from "@/lib/scenes/DictionaryScene.svelte";
  import ModelsScene from "@/lib/scenes/ModelsScene.svelte";
  import PanePerThemeScene from "@/lib/scenes/PanePerThemeScene.svelte";
  import PanesScene from "@/lib/scenes/PanesScene.svelte";
  import ReadAloudScene from "@/lib/scenes/ReadAloudScene.svelte";
  import ThemesScene from "@/lib/scenes/ThemesScene.svelte";
</script>

<div class="min-h-screen bg-paper text-ink">
  <Nav />
  <main>
    <Hero />

    <Feature
      id="themes"
      title="Limitless themes."
      lead="Light, dark, dim or black. Any hue, at any strength. Real paper, lines, grid or dots, and film grain. Save as many looks as you like, and a PDF wears each one exactly as an EPUB does."
    >
      <ThemesScene />
    </Feature>

    <Feature
      id="panes"
      title="Four books at once."
      lead="Split by dropping a book on a pane's edge. Each pane reads on its own, and a change of look lands on all of them, and the chrome, at the same moment."
    >
      <PanesScene />
    </Feature>

    <Feature
      id="per-pane"
      title="Or a look for each pane."
      lead="Turn on Theme per pane and every pane keeps its own colour, mode and texture. Only the film grain stays shared, so the window still feels like one thing."
    >
      <PanePerThemeScene />
    </Feature>

    <Feature
      id="ai"
      title="Your keys. Your machine."
      lead="Bring your own API keys, with a rotator built in: keys take turns, a rate-limited one rests, a rejected one is set aside. Or stay local with Ollama, LM Studio, or Apple Intelligence on Apple silicon."
    >
      <ModelsScene />
    </Feature>

    <Feature
      id="dictionary"
      title="Ask the page."
      lead="Select a word for its meaning in context, synonyms and usages, from whichever model you chose. The mark stays with the book, and its card with the mark."
    >
      <DictionaryScene />
    </Feature>

    <Feature
      id="read-aloud"
      title="Read along, offline."
      lead="Four neural voice models download once and speak from your computer; no cloud, no account. Words light up as they're heard, and the player follows you around the page."
    >
      <ReadAloudScene />
    </Feature>

    <AroundBooks />
    <Download />
  </main>
  <Footer />
</div>
