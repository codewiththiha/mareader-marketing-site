// Donation methods: one EVM address across nine networks, plus single-chain ones.
export interface Chain {
	id: string;
	name: string;
	mono: string;
}

export interface Method {
	id: string;
	name: string;
	standard: string;
	address: string;
	chains?: Chain[];
}

export const EVM_ADDRESS = "0xFaC170C240dFC6419Ff8d9D8108E2e2D88f595d7";

export const EVM_CHAINS: Chain[] = [
	{ id: "ethereum", name: "Ethereum", mono: "ETH" },
	{ id: "polygon", name: "Polygon", mono: "POL" },
	{ id: "base", name: "Base", mono: "BASE" },
	{ id: "arbitrum", name: "Arbitrum", mono: "ARB" },
	{ id: "op", name: "OP Mainnet", mono: "OP" },
	{ id: "linea", name: "Linea", mono: "LIN" },
	{ id: "bnb", name: "BNB Chain", mono: "BNB" },
	{ id: "monad", name: "Monad", mono: "MON" },
	{ id: "arc", name: "Arc", mono: "ARC" }
];

export const METHODS: Method[] = [
	{
		id: "evm",
		name: "One address, nine networks",
		standard: "EVM",
		address: EVM_ADDRESS,
		chains: EVM_CHAINS
	},
	{ id: "bitcoin", name: "Bitcoin", standard: "BTC", address: "bc1qg454fmqylphrzfqh2kdvlq54dt8t2kqaz452wm" },
	{ id: "solana", name: "Solana", standard: "SOL", address: "FJKswEYdwJufp978ycwCcVbSVhZvrEnchoEbWcuKi1Zy" },
	{ id: "tron", name: "Tron", standard: "TRC-20", address: "TGdk1Y2rsd2Rm1Nh79d7KSBDyNrRQ5Xhau" },
	{
		id: "stellar",
		name: "Stellar",
		standard: "XLM",
		address: "GBFFH6S4R2VFSU7O5YAB3IWCLEHMSLWNYSKEYKUNV5O7C5ZESHI63QVQ"
	}
];

export interface LocalMethod {
	id: string;
	name: string;
	hint: string;
}

export const LOCAL_METHODS: LocalMethod[] = [
	{ id: "kbzpay", name: "KBZPay", hint: "Account name and QR arrive with the next release." },
	{ id: "wavepay", name: "WavePay", hint: "Account name and QR arrive with the next release." },
	{ id: "ayapay", name: "AYA Pay", hint: "Account name and QR arrive with the next release." }
];

export const MODE_KEY = "mareader-donate-mode";

export function guessLocal(): boolean {
	try {
		const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const langs = navigator.languages?.join(",") ?? navigator.language;
		return zone === "Asia/Yangon" || /(^|[,;-])my([-_]|$)/i.test(langs);
	} catch {
		return false;
	}
}
