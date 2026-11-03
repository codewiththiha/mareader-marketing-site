export type ProviderId = "apple" | "openai" | "gemini" | "openrouter" | "ollama" | "lmstudio" | "custom";

export interface Provider {
	id: ProviderId;
	name: string;
	detail: string;
	tile: string;
}

export const PROVIDERS: Provider[] = [
	{ id: "apple", name: "Apple Intelligence", detail: "On this Mac, private and offline", tile: "On this Mac" },
	{ id: "openai", name: "OpenAI", detail: "Needs an API key", tile: "API key" },
	{ id: "gemini", name: "Google Gemini", detail: "Needs an API key", tile: "API key" },
	{ id: "openrouter", name: "OpenRouter", detail: "Many models, one API key", tile: "Many models" },
	{ id: "ollama", name: "Ollama", detail: "A model running on this computer", tile: "On this computer" },
	{ id: "lmstudio", name: "LM Studio", detail: "A model running on this computer", tile: "On this computer" },
	{ id: "custom", name: "Custom server", detail: "Any OpenAI-compatible address", tile: "Any /v1 address" }
];

export interface KeyRow {
	shown: string;
	state: string;
	banned?: boolean;
}

export interface ModelRow {
	id: ProviderId;
	name: string;
	note: string;
	warn?: boolean;
	tasks: string[];
}
