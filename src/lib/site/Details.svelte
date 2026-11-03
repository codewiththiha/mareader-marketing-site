<script lang="ts">
  import Icon from "$lib/icons/Icon.svelte";
  import { ChartNoAxesColumnIncreasing, LibraryBig, ScrollText, Search, StickyNote, Type, type IconNode } from "$lib/icons/nodes";

  const DETAILS: [IconNode, string, string][] = [
    [StickyNote, "Notes that stay with the book", "Mark a passage, add a thought, and find it again in Notes."],
    [ChartNoAxesColumnIncreasing, "Words above your level", "Shade words past your CEFR level and look them up in place."],
    [ScrollText, "Whole-page AI", "Summarize, translate or simplify a page, right where it sits."],
    [Type, "Every script, every direction", "Vertical Chinese and right-to-left books read the way they were set."],
    [LibraryBig, "A library that shelves itself", "AI proposes shelves for hundreds of books. You approve the plan."],
    [Search, "Search that keeps up", "Find any phrase, washed in place on the page it lives on."],
  ];
</script>

<section class="mx-auto max-w-[1080px] px-6 pb-24 pt-28 sm:pt-36">
  <h2 class="serif max-w-[16ch] text-[clamp(30px,4vw,48px)] font-[540] leading-[1.08] tracking-[-0.02em]">And the quiet details.</h2>
  <div class="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
    {#each DETAILS as [node, title, text] (title)}
      <div class="border-t border-[var(--line)] pt-5">
        <Icon {node} size={20} strokeWidth={1.8} class="text-[var(--accent)]" ariaHidden />
        <h3 class="mt-3.5 text-[16.5px] font-semibold tracking-[-0.01em]">{title}</h3>
        <p class="mt-1.5 text-[15px] leading-[1.55] text-[var(--muted)]">{text}</p>
      </div>
    {/each}
  </div>
</section>
