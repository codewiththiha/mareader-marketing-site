/**
 * Light, dark, or whatever the system says. `index.html` resolves the stored
 * preference before first paint; this module owns every change after that.
 * See docs/design.md § Theme.
 */

export type ThemePref = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const KEY = 'mareader.theme';
const query = window.matchMedia('(prefers-color-scheme: dark)');

function read(): ThemePref {
  const saved = localStorage.getItem(KEY);
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
}

let pref = $state<ThemePref>(read());
let systemDark = $state(query.matches);
let started = false;

function resolved(): ResolvedTheme {
  if (pref === 'system') return systemDark ? 'dark' : 'light';
  return pref;
}

function paint(): void {
  const next = resolved();
  document.documentElement.dataset.theme = next;
  // Keeps the mobile browser chrome in step with the paper.
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((tag) => tag.setAttribute('content', next === 'dark' ? '#101012' : '#fbfaf8'));
}

export const theme = {
  get pref(): ThemePref {
    return pref;
  },
  get resolved(): ResolvedTheme {
    return resolved();
  },
  set(next: ThemePref): void {
    pref = next;
    localStorage.setItem(KEY, next);
    paint();
  },
  /** Flips between the two painted modes, never back to `system`. */
  toggle(): void {
    theme.set(resolved() === 'dark' ? 'light' : 'dark');
  },
  init(): void {
    if (started) return;
    started = true;
    query.addEventListener('change', (event) => {
      systemDark = event.matches;
      if (pref === 'system') paint();
    });
    paint();
  },
};
