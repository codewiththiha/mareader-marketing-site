/**
 * A Svelte action that fades an element in the first time it is scrolled to.
 * It sets a data attribute rather than writing inline styles so the transition
 * itself stays in app.css, where the reduced-motion override lives.
 */

export interface RevealOptions {
  /** Milliseconds to hold, for staggering a group. */
  delay?: number;
  /** How much of the element must show first. */
  threshold?: number;
}

export function reveal(node: HTMLElement, options: RevealOptions = {}) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    node.dataset.reveal = 'in';
    return {};
  }

  node.dataset.reveal = 'out';
  if (options.delay) node.style.setProperty('--reveal-delay', `${options.delay}ms`);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        node.dataset.reveal = 'in';
        observer.disconnect();
      }
    },
    { threshold: options.threshold ?? 0.16, rootMargin: '0px 0px -8% 0px' },
  );

  observer.observe(node);
  return {
    destroy() {
      observer.disconnect();
    },
  };
}
