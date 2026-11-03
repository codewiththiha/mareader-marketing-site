// router — hash routes: #/ home, #/releases, #/support
export type Route = "home" | "releases" | "support";

const KNOWN: Route[] = ["home", "releases", "support"];

function fromHash(hash: string): Route {
  const slug = hash.replace(/^#\/?/, "").split("?")[0];
  return (KNOWN as string[]).includes(slug) ? (slug as Route) : "home";
}

let route = $state<Route>(typeof location === "undefined" ? "home" : fromHash(location.hash));
let direction = $state(1);

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    const next = fromHash(location.hash);
    if (next !== route) {
      direction = KNOWN.indexOf(next) > KNOWN.indexOf(route) ? 1 : -1;
      route = next;
    }
  });
}

export function href(r: Route): string {
  return r === "home" ? "#/" : `#/${r}`;
}

export function go(r: Route): void {
  const target = href(r);
  if (location.hash !== target) location.hash = target;
}

export const router = {
  get route(): Route {
    return route;
  },
  get direction(): number {
    return direction;
  },
  go
};
