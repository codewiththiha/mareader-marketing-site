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
let mobile = $state(false);
let pinned = $state(false);
let initialized = false;

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
  if (os === "mac" && !arch) arch = archFromGL(glRenderer());
}

export const platform = {
  get os(): OS {
    return os;
  },
  get arch(): Arch {
    return arch;
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
    const ua = navigator.userAgent;
    os = osFromUA(ua);
    mobile = isMobileUA(ua);
    const q = overridesFromQuery(location.search);
    if (q.os) {
      os = q.os;
      mobile = q.os === "other";
      pinned = true;
    }
    if (q.arch) {
      arch = q.arch;
      pinned = true;
    }
    if (!pinned) void refine();
  },
  setArch(a: Arch): void {
    arch = a;
  }
};
