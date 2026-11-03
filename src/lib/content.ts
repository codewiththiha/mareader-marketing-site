export interface Book {
	id: string;
	title: string;
	short: string;
	author: string;
	format: "EPUB" | "PDF";
	tone: string;
	progress?: number;
}

export const TONES = {
	navy: "#1f2d4d",
	forest: "#1f3d2e",
	oxblood: "#4a1d24",
	ochre: "#7a5a1e",
	slate: "#3a4350",
	plum: "#44264a",
	teal: "#1d4448",
	olive: "#4b4f22",
	rust: "#6b3220",
	indigo: "#2b2a5c"
};

export const BOOKS: Book[] = [
	{
		id: "moby",
		title: "Moby-Dick; or, The Whale",
		short: "Moby-Dick",
		author: "Herman Melville",
		format: "EPUB",
		tone: TONES.navy,
		progress: 12
	},
	{
		id: "pride",
		title: "Pride and Prejudice",
		short: "Pride and Prejudice",
		author: "Jane Austen",
		format: "EPUB",
		tone: TONES.oxblood,
		progress: 64
	},
	{
		id: "walden",
		title: "Walden; or, Life in the Woods",
		short: "Walden",
		author: "Henry David Thoreau",
		format: "EPUB",
		tone: TONES.forest,
		progress: 31
	},
	{
		id: "einstein",
		title: "On the Electrodynamics of Moving Bodies",
		short: "Electrodynamics",
		author: "A. Einstein",
		format: "PDF",
		tone: TONES.slate,
		progress: 8
	},
	{ id: "raven", title: "The Raven", short: "The Raven", author: "Edgar Allan Poe", format: "EPUB", tone: TONES.plum },
	{
		id: "dracula",
		title: "Dracula",
		short: "Dracula",
		author: "Bram Stoker",
		format: "EPUB",
		tone: TONES.rust,
		progress: 47
	}
];

export const MOBY = {
	chapter: "Chapter 1",
	heading: "Loomings",
	paragraphs: [
		"Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation.",
		"Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can.",
		"There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs—commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land. Look at the crowds of water-gazers there.",
		"Circumambulate the city of a dreamy Sabbath afternoon. Go from Corlears Hook to Coenties Slip, and from thence, by Whitehall, northward. What do you see?—Posted like silent sentinels all around the town, stand thousands upon thousands of mortal men fixed in ocean reveries."
	]
};

export const PRIDE = {
	chapter: "Chapter 1",
	heading: "",
	paragraphs: [
		"It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
		"However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.",
		"“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”",
		"Mr. Bennet replied that he had not.",
		"“But it is,” returned she; “for Mrs. Long has just been here, and she told me all about it.”"
	]
};

export const WALDEN = {
	chapter: "Economy",
	heading: "",
	paragraphs: [
		"When I wrote the following pages, or rather the bulk of them, I lived alone, in the woods, a mile from any neighbor, in a house which I had built myself, on the shore of Walden Pond, in Concord, Massachusetts, and earned my living by the labor of my hands only.",
		"I lived there two years and two months. At present I am a sojourner in civilized life again.",
		"I should not obtrude my affairs so much on the notice of my readers if very particular inquiries had not been made by my townsmen concerning my mode of life, which some would call impertinent, though they do not appear to me at all impertinent, but, considering the circumstances, very natural and pertinent."
	]
};

export const PAPER = {
	title: "On the Electrodynamics of Moving Bodies",
	author: "A. Einstein",
	note: "Annalen der Physik, 17 (1905), 891–921",
	abstract:
		"It is known that Maxwell’s electrodynamics—as usually understood at the present time—when applied to moving bodies, leads to asymmetries which do not appear to be inherent in the phenomena. Take, for example, the reciprocal electrodynamic action of a magnet and a conductor. The observable phenomenon here depends only on the relative motion of the conductor and the magnet, whereas the customary view draws a sharp distinction between the two cases in which either the one or the other of these bodies is in motion.",
	body: [
		"Examples of this sort, together with the unsuccessful attempts to discover any motion of the earth relatively to the “light medium,” suggest that the phenomena of electrodynamics as well as of mechanics possess no properties corresponding to the idea of absolute rest.",
		"We will raise this conjecture (the purport of which will hereafter be called the “Principle of Relativity”) to the status of a postulate, and also introduce another postulate, which is only apparently irreconcilable with the former, namely, that light is always propagated in empty space with a definite velocity c which is independent of the state of motion of the emitting body.",
		"The theory to be developed is based—like all electrodynamics—on the kinematics of the rigid body, since the assertions of any such theory have to do with the relationships between rigid bodies (systems of co-ordinates), clocks, and electromagnetic processes.",
		"If we wish to describe the motion of a material point, we give the values of its co-ordinates as functions of the time. Now we must bear carefully in mind that a mathematical description of this kind has no physical meaning unless we are quite clear as to what we understand by “time.”"
	]
};

export const SPOKEN =
	"Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.";

export interface PageText {
	chapter: string;
	heading: string;
	paragraphs: string[];
}

export const PAGE_TEXTS: Record<string, PageText> = {
	moby: MOBY,
	pride: PRIDE,
	walden: WALDEN,
	raven: MOBY,
	dracula: WALDEN
};

export const NAV_LINKS: [string, string][] = [
	["Themes", "#themes"],
	["Panes", "#panes"],
	["AI", "#ai"],
	["Read aloud", "#read-aloud"],
	["Download", "#download"]
];

export const BUILDS: [string, string][] = [
	["macOS 11+", "Apple silicon and Intel, .dmg"],
	["Windows 10 / 11", "Setup .exe, or .msi for managed machines"],
	["Linux", ".deb, AppImage, or PKGBUILD for Arch"]
];
