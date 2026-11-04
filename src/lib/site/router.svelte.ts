/** Hash router: the film stays home, notes and support get their own pages. */
export type Route = "home" | "releases" | "donate" | "download";

const parse = (hash: string): Route => {
  const h = hash.replace(/^#\/?/, "").split("?")[0];
  if (h === "releases" || h === "notes") return "releases";
  if (h === "donate" || h === "support") return "donate";
  if (h === "download" || h === "get") return "download";
  return "home";
};

function make() {
  let current = $state<Route>(typeof location === "undefined" ? "home" : parse(location.hash));
  const read = () => {
    const next = parse(location.hash);
    if (next !== current) {
      current = next;
      window.scrollTo({ top: 0 });
    }
  };
  if (typeof window !== "undefined") window.addEventListener("hashchange", read);
  return {
    get current() {
      return current;
    },
    go(route: Route) {
      location.hash = route === "home" ? "/" : `/${route}`;
    },
    href(route: Route) {
      return route === "home" ? "#/" : `#/${route}`;
    },
  };
}

export const router = make();
