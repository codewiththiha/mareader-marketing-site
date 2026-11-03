/** Where the visitor reads from: Myanmar gets local ways first, everyone else crypto. */
export type RegionMode = "mm" | "intl";
export type RegionChoice = "auto" | RegionMode;

const KEY = "mr-region";

function detected(): RegionMode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Yangon") return "mm";
  } catch {
    /* Intl unavailable */
  }
  return /^my[-_]/i.test(navigator.language || "") ? "mm" : "intl";
}

function make() {
  let choice = $state<RegionChoice>("auto");
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "mm" || saved === "intl") choice = saved;
  } catch {
    /* saved choice unreachable */
  }
  const auto = detected();
  return {
    get choice() {
      return choice;
    },
    get mode(): RegionMode {
      return choice === "auto" ? auto : choice;
    },
    get autoMode() {
      return auto;
    },
    set(next: RegionChoice) {
      choice = next;
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* choice cannot persist here */
      }
    },
  };
}

export const region = make();
