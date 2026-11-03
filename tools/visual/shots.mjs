// Shot matrix: which scene, viewport, theme and frame count each capture is taken at.
export const SCENES = [
  { id: "hero", selector: "main > section:first-of-type" },
  { id: "themes", selector: "#themes" },
  { id: "panes", selector: "#panes" },
  { id: "per-pane", selector: "#per-pane" },
  { id: "ai", selector: "#ai" },
  { id: "dictionary", selector: "#dictionary" },
  { id: "read-aloud", selector: "#read-aloud" },
];

export const VIEWPORTS = [
  { id: "1440", width: 1440, height: 900 },
  { id: "1280", width: 1280, height: 800 },
  { id: "390", width: 390, height: 844 },
];

export const FRAMES_PER_SECOND = 1000 / 64;

const frames = (ms) => Math.round(ms / 64);

export function plan() {
  const shots = [];
  for (const scene of SCENES) {
    for (const ms of [0, 2500, 11000]) {
      shots.push({ name: `${scene.id}--1440-light-f${frames(ms)}`, scene, viewport: VIEWPORTS[0], theme: "light", ms });
    }
    shots.push({ name: `${scene.id}--1440-dark-f${frames(6000)}`, scene, viewport: VIEWPORTS[0], theme: "dark", ms: 6000 });
    shots.push({ name: `${scene.id}--1280-light-f${frames(15000)}`, scene, viewport: VIEWPORTS[1], theme: "light", ms: 15000 });
    shots.push({ name: `${scene.id}--390-light-f${frames(22000)}`, scene, viewport: VIEWPORTS[2], theme: "light", ms: 22000 });
  }
  return shots;
}
