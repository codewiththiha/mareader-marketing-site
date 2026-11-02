<script lang="ts">
  // Facts — three feature blocks
  import { Cpu, FileText, Scale } from "@lucide/svelte";
  import { reveal } from "@/lib/actions/reveal.svelte";

  const FACTS = [
    { icon: Cpu, title: "Light on your machine", body: "A native app, not a webview. Pages render in a fraction of the memory browser-based readers need." },
    { icon: FileText, title: "Open what you own", body: "PDF, EPUB, Markdown and plain text, with shelves, search, notes and highlights built in." },
    { icon: Scale, title: "Free and open source", body: "MIT licensed. No account, no subscription. Your library stays on your disk." }
  ];
</script>

<div use:reveal class="reveal mt-14 grid gap-10 sm:mt-20 sm:grid-cols-3 sm:gap-12">
  {#each FACTS as { icon: Icon, title, body }}
    <div class="text-center sm:text-left">
      <Icon size={22} strokeWidth={1.5} class="mx-auto text-[var(--gold)] sm:mx-0" />
      <h3 class="mt-4 font-serif text-[20px] font-medium tracking-[-0.01em]">{title}</h3>
      <p class="mt-2 text-[15px] leading-[1.6] text-[var(--fg2)]">{body}</p>
    </div>
  {/each}
</div>
