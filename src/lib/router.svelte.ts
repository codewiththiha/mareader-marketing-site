// Hash router with three routes and section anchors, no dependencies.
export type Route = "/" | "/releases" | "/donate";

export const route = $state({ path: "/" as Route, anchor: "" });

function read(): void {
	const raw = typeof location === "undefined" ? "" : location.hash.replace(/^#/, "");
	if (raw.startsWith("/")) {
		route.path = raw === "/releases" || raw === "/donate" ? raw : "/";
		route.anchor = "";
	} else {
		route.path = "/";
		route.anchor = raw;
	}
}

read();

if (typeof window !== "undefined") window.addEventListener("hashchange", read);

export function navigate(path: Route, anchor = ""): void {
	if (typeof location === "undefined") return;
	location.hash = path === "/" ? anchor || "/" : path;
	read();
}

export function href(path: Route, anchor = ""): string {
	return path === "/" ? `#${anchor || "/"}` : `#${path}`;
}
