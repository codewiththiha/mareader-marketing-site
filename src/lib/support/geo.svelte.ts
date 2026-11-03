// geo — the support page's first impression: Myanmar sees local first
export type Method = "crypto" | "local";

const KEY = "mareader-support-method";

function stored(): Method | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "crypto" || v === "local" ? v : null;
  } catch {
    return null;
  }
}

export function looksMyanmar(): boolean {
  try {
    // Chrome normalises Asia/Yangon to the legacy Asia/Rangoon id
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Yangon" || tz === "Asia/Rangoon") return true;
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    return langs.some((l) => /^my([-_]|$)/i.test(l));
  } catch {
    return false;
  }
}

let chosen = $state<Method | null>(null);
let suggested = $state(false);
let initialized = false;

export const support = {
  get method(): Method {
    return chosen ?? (suggested ? "local" : "crypto");
  },
  get suggested(): boolean {
    return suggested && chosen === null;
  },
  init(): void {
    if (initialized) return;
    initialized = true;
    suggested = looksMyanmar();
    chosen = stored();
    // ?support=local|crypto — every state reachable by name, for tests
    const q = /[?&]support=(crypto|local)\b/.exec(location.search)?.[1];
    if (q === "local" || q === "crypto") chosen = q;
  },
  choose(m: Method): void {
    chosen = m;
    try {
      localStorage.setItem(KEY, m);
    } catch {
      // private mode: the choice lives for this page only
    }
  },
  flip(): void {
    support.choose(support.method === "crypto" ? "local" : "crypto");
  }
};
