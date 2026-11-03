// Release history mirrored from the app repository's docs/releases notes.
import { REPO } from "$lib/links";
import type { Client } from "$lib/os";

export interface Asset {
	os: Client;
	arch: string;
	kind: string;
	file: string;
}

export interface Release {
	version: string;
	date: string;
	tagline: string;
	highlights: string[];
	assets: Asset[];
}

function assets(v: string): Asset[] {
	return [
		{ os: "macOS", arch: "Apple silicon", kind: "dmg", file: `Mareader_${v}_aarch64.dmg` },
		{ os: "macOS", arch: "Intel", kind: "dmg", file: `Mareader_${v}_x64.dmg` },
		{ os: "Windows", arch: "x64", kind: "setup", file: `mareader_${v}_x64-setup.exe` },
		{ os: "Windows", arch: "x64, managed", kind: "msi", file: `mareader_${v}_x64_en-US.msi` },
		{ os: "Linux", arch: "amd64", kind: "deb", file: `mareader_${v}_amd64.deb` },
		{ os: "Linux", arch: "x86_64", kind: "AppImage", file: `mareader_${v}_x86_64.AppImage` },
		{ os: "Linux", arch: "Arch", kind: "tar.gz + PKGBUILD", file: `mareader_${v}_x86_64.tar.gz` }
	];
}

export function assetUrl(release: Release, asset: Asset): string {
	return `${REPO}/releases/download/${release.version}/${asset.file}`;
}

export function sumsUrl(release: Release): string {
	return `${REPO}/releases/download/${release.version}/SHA256SUMS`;
}

export const RELEASES: Release[] = [
	{
		version: "v0.0.5",
		date: "2026-10-29",
		tagline: "Reading aloud becomes reading along.",
		highlights: [
			"Words light up as they are spoken, timed to the voice itself with Kokoro, Piper and Kitten.",
			"A compact player sits over the page; drag its sides, or let it grow into a card when the words scroll away.",
			"A fourth voice model, Phonon, joins the catalogue in Settings › Read aloud.",
			"Mareader gets a new icon: an open book whose edges draw an M, with one line highlighted."
		],
		assets: assets("v0.0.5")
	},
	{
		version: "v0.0.4",
		date: "2026-10-25",
		tagline: "Read aloud arrives, and the app gets lighter.",
		highlights: [
			"Any book reads aloud in system voices or neural voices that download once and run offline.",
			"Dictionary and AI cards show pronunciation as IPA or an easy respelling, and say the word aloud.",
			"Books edited elsewhere reload by themselves within about two seconds, keeping your place.",
			"Closed books let go of their memory; a long book closes about 30 MiB lower."
		],
		assets: assets("v0.0.4")
	},
	{
		version: "v0.0.3",
		date: "2026-10-20",
		tagline: "Page AI arrives.",
		highlights: [
			"Right-click a page to summarize, translate or simplify it; the result stays with the book.",
			"In EPUB, Markdown and text books a result is laid into the book in your own type.",
			"Continuous mode asks the next few pages ahead after a short stay on a finished page.",
			"PDF results get their own font, size and spacing in Settings › Appearance."
		],
		assets: assets("v0.0.3")
	},
	{
		version: "v0.0.2",
		date: "2026-10-18",
		tagline: "A dictionary of its own, and a rebuilt Library.",
		highlights: [
			"A full dictionary page and a floating one: move it, resize it, fold it to a pill, or open it as a page.",
			"Notes on any highlight, bookmarks, and export of highlights and notes.",
			"A home-screen library grid you arrange by dragging, with shelves made by stacking books.",
			"Burmese and other complex scripts shaped correctly in every panel."
		],
		assets: assets("v0.0.2")
	},
	{
		version: "v0.0.1",
		date: "2026-10-16",
		tagline: "The first build.",
		highlights: [
			"A calm reader for PDF, EPUB, plain text and Markdown, native with no webview.",
			"Up to four panes, each with its own theme, paper, tint, texture and grain.",
			"Highlights, gloss cards, offline dictionaries, CEFR word levels and AI explain.",
			"Search in both formats, and full keyboard control throughout."
		],
		assets: assets("v0.0.1")
	}
];

export const CURRENT = RELEASES[0];
