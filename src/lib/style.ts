const UNITLESS = new Set([
  "animationIterationCount",
  "aspectRatio",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "boxFlex",
  "boxFlexGroup",
  "boxOrdinalGroup",
  "columnCount",
  "columns",
  "flex",
  "flexGrow",
  "flexPositive",
  "flexShrink",
  "flexNegative",
  "flexOrder",
  "gridArea",
  "gridRow",
  "gridRowStart",
  "gridRowEnd",
  "gridRowSpan",
  "gridColumn",
  "gridColumnStart",
  "gridColumnEnd",
  "gridColumnSpan",
  "fontWeight",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
  "fillOpacity",
  "floodOpacity",
  "stopOpacity",
  "strokeDasharray",
  "strokeDashoffset",
  "strokeMiterlimit",
  "strokeOpacity",
  "strokeWidth",
]);

export type StyleValue = string | number | boolean | null | undefined;
export type StyleObject = Record<string, StyleValue>;

const dashed = (key: string): string => (key.startsWith("--") ? key : key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`));

function declared(key: string, raw: StyleValue): string | null {
  if (typeof raw === "boolean") return null;
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) return null;
    if (raw === 0) return "0";
    return UNITLESS.has(key) ? String(raw) : `${raw}px`;
  }
  return raw;
}

export function styles(input: StyleObject | null | undefined, extra = ""): string {
  const parts: string[] = [];
  if (input) {
    for (const [key, raw] of Object.entries(input)) {
      const value = declared(key, raw);
      if (value !== null) parts.push(`${dashed(key)}:${value}`);
    }
  }
  const base = parts.join(";");
  if (!extra) return base;
  return base ? `${base};${extra}` : extra;
}
