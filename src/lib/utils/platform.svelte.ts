/** Reads the visitor's platform once, for the download buttons. */
import { parseArm, parseOs, type Os } from "$lib/site/downloads";

function make() {
  let os = $state<Os>("unknown");
  let arm = $state(true);
  if (typeof navigator !== "undefined") {
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    os = parseOs(nav.userAgent, nav.userAgentData?.platform ?? "");
    arm = parseArm(nav.userAgent);
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
