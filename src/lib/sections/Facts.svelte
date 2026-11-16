<script lang="ts">
  // Facts — three promises, icons that wake on hover
  import { Cpu, BookOpen, Scale } from "@lucide/svelte";
  import { reveal } from "@/lib/actions/reveal.svelte";

  const FACTS = [
    {
      icon: Cpu,
      ico: "fact-cpu",
      title: "Light on your machine",
      body: "A native app, not a webview. Pages render in a fraction of the memory browser-based readers need."
    },
    {
      icon: BookOpen,
      ico: "fact-book",
      title: "Open what you own",
      body: "PDF and EPUB, with shelves, watched folders, search, gloss cards and highlights built in."
    },
    {
      icon: Scale,
      ico: "fact-scale",
      title: "Free and open source",
      body: "MIT licensed. No account, no subscription. Your library stays on your disk."
    }
  ];
</script>

<div use:reveal class="reveal facts">
  {#each FACTS as { icon: Icon, ico, title, body }, index (title)}
    <div class="fact">
      <div class="fact-top" aria-hidden="true">
        <span class="fact-ico {ico}"><Icon size={23} strokeWidth={1.5} /></span>
        <span class="fact-number">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 class="fact-h">{title}</h3>
      <p class="fact-p">{body}</p>
    </div>
  {/each}
</div>
