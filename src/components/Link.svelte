<script lang="ts">
  import { router, isCurrent } from '../lib/router.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    href: string;
    class?: string;
    /** Runs before the route changes, for closing a menu. */
    onclick?: (event: globalThis.MouseEvent) => void;
    /** Everything else (`aria-label`, `title`, …) lands on the anchor. */
    [key: string]: unknown;
    children: Snippet;
  }

  let { href, class: className = '', onclick, children, ...rest }: Props = $props();

  function follow(event: globalThis.MouseEvent): void {
    onclick?.(event);
    // Modified clicks keep their browser meaning: new tab, new window, save.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
      return;
    event.preventDefault();
    router.navigate(href);
  }
</script>

<a
  {href}
  class={className}
  onclick={follow}
  aria-current={isCurrent(href) ? 'page' : undefined}
  {...rest}
>
  {@render children()}
</a>
