// platform store — best guess at once, refined asynchronously
import {
  archFromGL,
  archFromUAData,
  isMobileUA,
  osFromUA,
  overridesFromQuery,
  type Arch,
  type OS
} from "./platform";

interface UAData {
  getHighEntropyValues(hints: string[]): Promise<Record<string, string>>;
}

let os = $state<OS>("other");
let arch = $state<Arch>("");
let macChoice = $state<"arm64" | "x64" | null>(null);
let mobile = $state(false);
let pinned = $state(false);
let initialized = false;
const MAC_ARCH_KEY = "mareader-mac-arch";

function storedMacChoice(): "arm64" | "x64" | null {
  try {
    const choice = localStorage.getItem(MAC_ARCH_KEY);
    return choice === "arm64" || choice === "x64" ? choice : null;
  } catch {
    return null;
  }
}

function glRenderer(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) return "";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
  } catch {
    return "";
  }
}

async function refine(): Promise<void> {
  const uad = (navigator as Navigator & { userAgentData?: UAData }).userAgentData;
  if (uad?.getHighEntropyValues) {
    try {
      const v = await uad.getHighEntropyValues(["architecture", "platform"]);
      const hint = archFromUAData(String(v.platform ?? ""), String(v.architecture ?? ""));
      if (hint) arch = hint;
      if (v.platform === "macOS") os = "mac";
      else if (v.platform === "Windows") os = "windows";
      else if (v.platform === "Linux") os = "linux";
    } catch {
      // entropy hints refused: the UA guess stands
    }
  }
  if (os === "mac" && macChoice) arch = macChoice;
  else if (os === "mac" && !arch) arch = archFromGL(glRenderer());
}

export const platform = {
  get os(): OS {
    return os;
  },
  get arch(): Arch {
    return arch;
  },
  get macArch(): "arm64" | "x64" {
    return macChoice ?? (os === "mac" && arch === "x64" ? "x64" : "arm64");
  },
  get mobile(): boolean {
    return mobile;
  },
  get pinned(): boolean {
    return pinned;
  },
  init(): void {
    if (initialized) return;
    initialized = true;
    macChoice = storedMacChoice();
    const ua = navigator.userAgent;
    os = osFromUA(ua);
    mobile = isMobileUA(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    if ((os === "windows" || os === "linux") && /aarch64|arm64|armv8/i.test(ua)) {
      arch = "arm64";
    }
    const q = overridesFromQuery(location.search);
    if (q.os) {
      os = q.os;
      mobile = q.os === "other";
      pinned = true;
    }
    if (q.arch) {
      arch = q.arch;
      if (os === "mac") macChoice = q.arch;
      pinned = true;
    } else if (os === "mac" && macChoice) {
      arch = macChoice;
    }
    if (!pinned && !/cros/i.test(ua)) void refine();
  },
  setMacArch(a: "arm64" | "x64"): void {
    macChoice = a;
    if (os === "mac") arch = a;
    try {
      localStorage.setItem(MAC_ARCH_KEY, a);
    } catch {
      // A blocked store still keeps the choice for this visit.
    }
  }
};
