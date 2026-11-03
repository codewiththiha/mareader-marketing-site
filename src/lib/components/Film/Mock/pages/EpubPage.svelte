<script lang="ts">
  // EpubPage — reflowed book
  import type { Snippet } from "svelte";
  let {
    book,
    focusName,
    mark = "none",
    reading = null,
    children
  }: {
    book: "a" | "b";
    focusName?: string;
    mark?: "none" | "sel" | "ai";
    reading?: [number, number] | null;
    children?: Snippet;
  } = $props();

  const READ_SENTENCE = [
    "It",
    "is",
    "a",
    "way",
    "I",
    "have",
    "of",
    "driving",
    "off",
    "the",
    "spleen",
    "and",
    "regulating",
    "the",
    "circulation."
  ];

  const SP = " ";
</script>

<!-- one span per word, as before; the lit phrase shares one wash -->
{#snippet wordAt(w: string, i: number)}
  {@const isWord = w === "spleen"}
  <span
    >{#if isWord}<span class="mk-w mk-w-{mark}" data-focus="word">spleen{@render children?.()}</span
      >{:else}{w}{/if}{#if i < READ_SENTENCE.length - 1}{SP}{/if}</span
  >
{/snippet}

{#if book === "b"}
  <div class="mk-epub" data-focus={focusName}>
    <div class="mk-epub-col">
      <div class="mk-chap-n">Chapter I</div>
      <div class="mk-chap-t">A Truth Universally Acknowledged</div>
      <p>
        It is a truth universally acknowledged, that a single man in possession of a good fortune,
        must be in want of a wife.
      </p>
      <p>
        However little known the feelings or views of such a man may be on his first entering a
        neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he
        is considered the rightful property of some one or other of their daughters.
      </p>
      <p>
        &ldquo;My dear Mr. Bennet,&rdquo; said his lady to him one day, &ldquo;have you heard that
        Netherfield Park is let at last?&rdquo;
      </p>
      <p>Mr. Bennet replied that he had not.</p>
    </div>
  </div>
{:else}
  <div class="mk-epub" data-focus={focusName}>
    <div class="mk-epub-col">
      <div class="mk-chap-n">Chapter 1</div>
      <div class="mk-chap-t">Loomings</div>
      <p>
        Call me Ishmael. Some years ago&mdash;never mind how long precisely&mdash;having little or
        no money in my purse, and nothing particular to interest me on shore, I thought I would sail
        about a little and see the watery part of the world.
        {#if reading}
          {@const a = reading[0]}
          {@const b = reading[1]}
          {#each READ_SENTENCE.slice(0, a) as w, i (i)}{@render wordAt(w, i)}{/each}
          <span class="mk-phrase" data-focus="read"
            >{#each READ_SENTENCE.slice(a, b + 1) as w, j (j)}{@render wordAt(
                w,
                a + j
              )}{/each}</span
          >{#each READ_SENTENCE.slice(b + 1) as w, k (k)}{@render wordAt(w, b + 1 + k)}{/each}
        {:else}
          {#each READ_SENTENCE as w, i (i)}{@render wordAt(w, i)}{/each}
        {/if}
        Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in
        my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up
        the rear of every funeral I meet&mdash;then, I account it high time to get to sea as soon as I
        can.
      </p>
      <p>
        This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself
        upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but
        knew it, almost all men in their degree, some time or other, cherish very nearly the same
        feelings towards the ocean with me.
      </p>
      <p>
        There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by
        coral reefs &mdash;commerce surrounds it with her surf.
      </p>
    </div>
  </div>
{/if}
