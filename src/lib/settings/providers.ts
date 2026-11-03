import apple from "@/lib/assets/logos/apple.svg?raw";
import gemini from "@/lib/assets/logos/gemini.svg?raw";
import lmstudio from "@/lib/assets/logos/lm-studio.svg?raw";
import ollama from "@/lib/assets/logos/ollama.svg?raw";
import openai from "@/lib/assets/logos/openai.svg?raw";
import openrouter from "@/lib/assets/logos/openrouter.svg?raw";

export type ProviderId = "apple" | "openai" | "gemini" | "openrouter" | "ollama" | "lmstudio" | "custom";

const LOGOS: Record<ProviderId, string> = { apple, openai, gemini, openrouter, ollama, lmstudio, custom: "" };

export function logoSvg(id: ProviderId, size: number): string | null {
  if (id === "custom") return null;
  return LOGOS[id].replace('fill="white"', 'fill="currentColor"').replace('width="24" height="24"', `width="${size}" height="${size}"`);
}

export const PROVIDERS: { id: ProviderId; name: string; detail: string; tile: string }[] = [
  { id: "apple", name: "Apple Intelligence", detail: "On this Mac, private and offline", tile: "On this Mac" },
  { id: "openai", name: "OpenAI", detail: "Needs an API key", tile: "API key" },
  { id: "gemini", name: "Google Gemini", detail: "Needs an API key", tile: "API key" },
  { id: "openrouter", name: "OpenRouter", detail: "Many models, one API key", tile: "Many models" },
  { id: "ollama", name: "Ollama", detail: "A model running on this computer", tile: "On this computer" },
  { id: "lmstudio", name: "LM Studio", detail: "A model running on this computer", tile: "On this computer" },
  { id: "custom", name: "Custom server", detail: "Any OpenAI-compatible address", tile: "Any /v1 address" },
];
