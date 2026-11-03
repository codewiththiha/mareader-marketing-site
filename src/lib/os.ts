export type Client = "macOS" | "Windows" | "Linux";

export function clientName(): Client {
	if (typeof navigator === "undefined") return "macOS";
	const ua = navigator.userAgent;
	if (/Windows/i.test(ua)) return "Windows";
	if (/Linux|X11/i.test(ua) && !/Android/i.test(ua)) return "Linux";
	return "macOS";
}
