// themes — paper/ink tokens for panes
export type Texture = "none" | "paper" | "lined" | "grid" | "dotted" | "cross";

export interface AppTheme {
  id: string;
  name: string;
  base: "Light" | "Dark" | "Dim" | "Black";
  dark: boolean;
  hue: number;
  strength: number;
  paper: string;
  ink: string;
  muted: string;
  surface: string;
  line: string;
  accent: string;
  soft: string;
  card: string;
  texture: Texture;
  grain?: boolean;
}

export const THEMES: Record<string, AppTheme> = {
  light: {
    id: "light",
    name: "Light",
    base: "Light",
    dark: false,
    hue: 34,
    strength: 0,
    paper: "#ffffff",
    ink: "#1f2937",
    muted: "#6b7280",
    surface: "#ebedef",
    line: "#dadce1",
    accent: "#2563eb",
    soft: "#dbeafe",
    card: "#f7fafe",
    texture: "none"
  },
  dark: {
    id: "dark",
    name: "Dark",
    base: "Dark",
    dark: true,
    hue: 34,
    strength: 0,
    paper: "#131316",
    ink: "#e5e7eb",
    muted: "#9ca3af",
    surface: "#16161a",
    line: "#2b2b31",
    accent: "#60a5fa",
    soft: "#1d2b3a",
    card: "#1f2329",
    texture: "none"
  },
  sepia: {
    id: "sepia",
    name: "Sepia",
    base: "Light",
    dark: false,
    hue: 34,
    strength: 23,
    paper: "#f5ecd7",
    ink: "#3a3128",
    muted: "#7a6955",
    surface: "#eadfc6",
    line: "#d9cdb1",
    accent: "#97570f",
    soft: "#efdbb2",
    card: "#f0e5cb",
    texture: "none"
  },
  green: {
    id: "green",
    name: "Green",
    base: "Light",
    dark: false,
    hue: 104,
    strength: 20,
    paper: "#eaf0dd",
    ink: "#26301f",
    muted: "#5f6d57",
    surface: "#dfe8cf",
    line: "#cbd6b5",
    accent: "#3b7a22",
    soft: "#d3e6b8",
    card: "#e3ecd3",
    texture: "none"
  },
  night: {
    id: "night",
    name: "Night",
    base: "Dark",
    dark: true,
    hue: 110,
    strength: 18,
    paper: "#131610",
    ink: "#dde4d3",
    muted: "#9aa58f",
    surface: "#171b14",
    line: "#2a3025",
    accent: "#a3cf6a",
    soft: "#212c17",
    card: "#1d2218",
    texture: "none"
  },
  parchment: {
    id: "parchment",
    name: "Parchment",
    base: "Light",
    dark: false,
    hue: 40,
    strength: 28,
    paper: "#f1e2c0",
    ink: "#392a16",
    muted: "#725c40",
    surface: "#e6d5ae",
    line: "#d3c093",
    accent: "#8a4f0c",
    soft: "#ebd29a",
    card: "#ebdbb5",
    texture: "paper",
    grain: true
  },
  cinema: {
    id: "cinema",
    name: "Cinema",
    base: "Dim",
    dark: true,
    hue: 220,
    strength: 15,
    paper: "#1b1f26",
    ink: "#c3cad6",
    muted: "#8b94a3",
    surface: "#232830",
    line: "#313843",
    accent: "#7a9bd4",
    soft: "#243044",
    card: "#262c36",
    texture: "none",
    grain: true
  },
  ocean: {
    id: "ocean",
    name: "Unsaved look",
    base: "Light",
    dark: false,
    hue: 205,
    strength: 26,
    paper: "#e4eff5",
    ink: "#1b2b35",
    muted: "#527080",
    surface: "#d7e6ee",
    line: "#c1d6e1",
    accent: "#1c6c97",
    soft: "#c9e3f1",
    card: "#dbe9f0",
    texture: "none"
  },
  dusk: {
    id: "dusk",
    name: "Dusk",
    base: "Dark",
    dark: true,
    hue: 280,
    strength: 20,
    paper: "#16131c",
    ink: "#e6e0f1",
    muted: "#a198b5",
    surface: "#1b1722",
    line: "#2f2a3a",
    accent: "#b79cf0",
    soft: "#2a2140",
    card: "#231f2d",
    texture: "none"
  }
};

export const PRESETS = ["sepia", "green", "night", "parchment", "cinema"];

export function themeVars(t: AppTheme): Record<string, string> {
  return {
    "--paper": t.paper,
    "--ink": t.ink,
    "--muted": t.muted,
    "--surface": t.surface,
    "--line": t.line,
    "--accent": t.accent,
    "--soft": t.soft,
    "--card": t.card,
    "--danger": t.dark ? "#f87171" : "#dc2626",
    "--shadow": t.dark ? "rgba(0,0,0,.5)" : "rgba(40,30,10,.16)"
  };
}
