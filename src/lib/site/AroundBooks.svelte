<script lang="ts">
  import { BookA, Code2, Keyboard, LibraryBig, Search, Type } from "@lucide/svelte";

  const ITEMS = [
    {
      icon: LibraryBig,
      title: "A library that stays put",
      text: "Shelves, watched folders, books read in place. Covers look bound; progress is a bookmark ribbon.",
    },
    {
      icon: Type,
      title: "Typography you set",
      text: "Fonts, size, weight, line height, spacing, indent, justification, hyphenation. Single, spread, vertical or horizontal.",
    },
    {
      icon: BookA,
      title: "Offline dictionaries",
      text: "Downloadable packs looked up on click or hover, with CEFR shading for words above your level.",
    },
    {
      icon: Search,
      title: "Search both formats",
      text: "A lazy index across a PDF or a book, highlights with Undo, notes, and auto-scroll.",
    },
    {
      icon: Keyboard,
      title: "Everything by keyboard",
      text: "One keymap for the handler, the tooltips and the shortcut sheet, so they cannot disagree.",
    },
    {
      icon: Code2,
      title: "Open source, MIT",
      text: "egui and wgpu; pages by hayro, books by parley. Inter and Literata under the OFL, Lucide under ISC.",
    },
  ];
</script>

<section class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
  <h2 class="font-serif text-[30px] leading-[1.12] font-medium tracking-[-0.01em] sm:text-[40px]">Around the books.</h2>
  <div class="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
    {#each ITEMS as item (item.title)}
      {@const Icon = item.icon}
      <div class="flex gap-4">
        <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface text-ink">
          <Icon size={17} strokeWidth={2} />
        </span>
        <div>
          <h3 class="text-[15px] font-medium">{item.title}</h3>
          <p class="mt-1 text-[14px] leading-[1.5] text-muted">{item.text}</p>
        </div>
      </div>
    {/each}
  </div>
</section>
