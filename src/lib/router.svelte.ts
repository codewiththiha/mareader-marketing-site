/**
 * Three routes, no dependency. A route is a path string; `App.svelte` maps it
 * to a component. History API only — the host must serve `index.html` for
 * unknown paths (docs/architecture.md § Hosting).
 */

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

function normalise(path: string): string {
  const bare = path.startsWith(BASE) ? path.slice(BASE.length) : path;
  const trimmed = bare.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

let path = $state(normalise(window.location.pathname));
let started = false;

function commit(next: string, mode: 'push' | 'replace'): void {
  if (mode === 'push') window.history.pushState({}, '', BASE + next);
  else window.history.replaceState({}, '', BASE + next);
  path = normalise(next);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export const router = {
  get path(): string {
    return path;
  },
  navigate(to: string, options: { replace?: boolean } = {}): void {
    const target = normalise(to);
    if (target === path) return;
    commit(target, options.replace ? 'replace' : 'push');
  },
  init(): void {
    if (started) return;
    started = true;
    // `main.ts` may have rewritten the address after this module was evaluated.
    path = normalise(window.location.pathname);
    window.addEventListener('popstate', () => {
      path = normalise(window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  },
};

/** True when `href` points at the current route (for `aria-current`). */
export function isCurrent(href: string): boolean {
  return normalise(href) === path;
}
