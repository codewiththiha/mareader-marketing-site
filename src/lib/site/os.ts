export type Platform = "macOS" | "Windows" | "Linux";

export function osName(): Platform {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "Windows";
  if (/Linux|X11/i.test(ua) && !/Android/i.test(ua)) return "Linux";
  return "macOS";
}
