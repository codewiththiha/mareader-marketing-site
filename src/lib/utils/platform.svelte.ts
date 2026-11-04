/** Reads the visitor's platform once; architecture arrives async when the browser offers it. */
import { parseArm, parseOs, type Os } from "$lib/site/downloads";

interface Uad {
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }>;
}

function make() {
  let os = $state<Os>("unknown");
  let arm = $state(true);
  if (typeof navigator !== "undefined") {
    const nav = navigator as Navigator & { userAgentData?: Uad };
    const uad = nav.userAgentData;
    os = parseOs(nav.userAgent, uad?.platform ?? "");
    arm = parseArm(nav.userAgent);
    uad
      ?.getHighEntropyValues?.(["architecture"])
      .then((v) => {
        if (v.architecture) arm = v.architecture === "arm";
      })
      .catch(() => {
        /* the hint can be refused */
      });
  }
  return {
    get os() {
      return os;
    },
    get arm() {
      return arm;
    },
  };
}

export const platform = make();
