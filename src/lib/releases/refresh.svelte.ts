// refresh — baked data ships in the bundle; a newer release swaps in live
import { RELEASES, type Release } from "./data";

const API = "https://api.github.com/repos/codewiththiha/mareader2/releases?per_page=30";

let all = $state<Release[]>(RELEASES);
let live = $state(false);

function shape(raw: Record<string, unknown>[]): Release[] {
  return raw
    .filter((r) => !r.draft)
    .map((r) => ({
      tag: String(r.tag_name ?? ""),
      date: String(r.published_at ?? "").slice(0, 10),
      body: String(r.body ?? ""),
      assets: ((r.assets ?? []) as Record<string, unknown>[])
        .map((a) => ({
          name: String(a.name ?? ""),
          size: Number(a.size ?? 0),
          url: String(a.browser_download_url ?? "")
        }))
        .sort((x, y) => x.name.localeCompare(y.name))
    }));
}

export const releases = {
  get all(): Release[] {
    return all;
  },
  get latest(): Release {
    return all[0];
  },
  get live(): boolean {
    return live;
  },
  async refresh(): Promise<void> {
    try {
      const res = await fetch(API, { headers: { Accept: "application/vnd.github+json" } });
      if (!res.ok) return;
      const fresh = shape(await res.json());
      if (fresh.length && fresh[0].tag !== all[0]?.tag) {
        all = fresh;
        live = true;
      }
    } catch {
      // offline or rate limited: the baked data stands
    }
  }
};
