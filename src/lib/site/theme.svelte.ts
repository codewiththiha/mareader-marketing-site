/** Site theme: persisted choice, system fallback, applied to the document. */
import type { Site } from "$lib/looks";

function initial(): Site {
  try {
    const saved = localStorage.getItem("mr-site");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* storage may be unreadable */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

let current = $state<Site>(initial());

export const theme = {
  get current(): Site {
    return current;
  },
  toggle() {
    current = current === "dark" ? "light" : "dark";
  },
};
