// Deterministic view list for capture and comparison.
export const VIEWS = [
  { name: "hero-top", viewport: [1440, 900], mode: "top", wait: 2600 },
  { name: "step-themes", viewport: [1440, 900], mode: "step", step: 1, wait: 4550 },
  { name: "step-panes", viewport: [1440, 900], mode: "step", step: 2, wait: 3800 },
  { name: "step-together", viewport: [1440, 900], mode: "step", step: 3, wait: 4500 },
  { name: "step-perpane", viewport: [1440, 900], mode: "step", step: 4, wait: 4600 },
  { name: "step-word", viewport: [1440, 900], mode: "step", step: 5, wait: 3600 },
  { name: "step-keys", viewport: [1440, 900], mode: "step", step: 6, wait: 3650 },
  { name: "step-local", viewport: [1440, 900], mode: "step", step: 7, wait: 3500 },
  { name: "step-listen", viewport: [1440, 900], mode: "step", step: 8, wait: 4000, maxDiff: 0.01 },
  { name: "step-voices", viewport: [1440, 900], mode: "step", step: 9, wait: 3500, maxDiff: 0.01 },
  { name: "details", viewport: [1440, 900], mode: "anchor", sel: "#tour + section", wait: 1400 },
  { name: "get", viewport: [1440, 900], mode: "anchor", sel: "#download", wait: 1400 },
  { name: "footer", viewport: [1440, 900], mode: "bottom", wait: 1200 },
  { name: "dark-hero-top", viewport: [1440, 900], mode: "top", dark: true, wait: 2600 },
  { name: "dark-step-themes", viewport: [1440, 900], mode: "step", step: 1, dark: true, wait: 4550 },
  { name: "dark-step-word", viewport: [1440, 900], mode: "step", step: 5, dark: true, wait: 3600 },
  { name: "dark-step-keys", viewport: [1440, 900], mode: "step", step: 6, dark: true, wait: 3650 },
  { name: "dark-details", viewport: [1440, 900], mode: "anchor", sel: "#tour + section", dark: true, wait: 1400 },
  { name: "dark-get", viewport: [1440, 900], mode: "anchor", sel: "#download", dark: true, wait: 1400 },
  { name: "mob-hero", viewport: [390, 844], mode: "top", wait: 2600 },
  { name: "mob-step-themes", viewport: [390, 844], mode: "step", step: 1, wait: 4550 },
  { name: "mob-step-panes", viewport: [390, 844], mode: "step", step: 2, wait: 3800 },
  { name: "mob-step-word", viewport: [390, 844], mode: "step", step: 5, wait: 3600 },
  { name: "mob-details", viewport: [390, 844], mode: "anchor", sel: "#tour + section", wait: 1400 },
  { name: "mob-get", viewport: [390, 844], mode: "anchor", sel: "#download", wait: 1400 },
];

// Bake views: one per entry the app publishes on ?bakelist, paired by index.
export const BAKE_COUNT = 16;
