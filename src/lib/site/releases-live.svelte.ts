/** Releases come from GitHub at runtime; the baked snapshot only covers the first paint. */
import { RELEASES } from "./releases";
import type { Release } from "./releases-type";

export const GH = "https://github.com/codewiththiha/mareader";
const API = "https://api.github.com/repos/codewiththiha/mareader/releases?per_page=30";

let all = $state<Release[]>(RELEASES);
let live = $state(false);
let asked = false;

interface RawAsset {
  name?: unknown;
  size?: unknown;
  browser_download_url?: unknown;
}

interface RawRelease {
  tag_name?: unknown;
  name?: unknown;
  published_at?: unknown;
  body?: unknown;
  draft?: unknown;
  assets?: unknown;
}

const asText = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");
const asSize = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

function shape(raw: RawRelease[]): Release[] {
  return raw
    .filter((r) => !r.draft)
    .map((r) => {
      const assets = Array.isArray(r.assets) ? (r.assets as RawAsset[]) : [];
      return {
        tag: asText(r.tag_name),
        name: asText(r.name) || asText(r.tag_name),
        published: asText(r.published_at).slice(0, 10),
        body: asText(r.body),
        assets: assets.map((a) => ({
          name: asText(a.name),
          size: asSize(a.size),
          url: asText(a.browser_download_url),
        })),
      };
    })
    .filter((r) => r.tag !== "");
}

export const releases = {
  get all(): Release[] {
    return all;
  },
  get latest(): Release {
    return all[0] ?? RELEASES[0];
  },
  get live(): boolean {
    return live;
  },
  async refresh(): Promise<void> {
    if (asked) return;
    asked = true;
    try {
      const res = await fetch(API, { headers: { Accept: "application/vnd.github+json" } });
      if (!res.ok) return;
      const fresh = shape((await res.json()) as RawRelease[]);
      if (fresh.length === 0) return;
      all = fresh;
      live = true;
    } catch {
      /* offline or rate limited: the baked snapshot stands */
    }
  },
};
