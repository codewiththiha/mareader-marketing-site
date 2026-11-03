import type { KeyRow, ModelRow } from "@/lib/settings/types";
import type { ProviderId } from "@/lib/settings/providers";
import type { Step } from "@/lib/timeline";

export interface ModelsState {
  models: ModelRow[];
  keys: KeyRow[];
  typing: string;
  showTiles: boolean;
  openProvider: ProviderId | null;
}

const APPLE: ModelRow = { id: "apple", name: "Apple Intelligence", note: "On this Mac, private and offline", tasks: ["AI Dictionary"] };
const OLLAMA: ModelRow = { id: "ollama", name: "Ollama · qwen3", note: "3 models on this computer", tasks: ["Library", "Translate"] };
const openai = (note: string, warn = false): ModelRow => ({
  id: "openai",
  name: "OpenAI · gpt-4.1-mini",
  note,
  warn,
  tasks: ["Summarize"],
});

const KEY = "sk-proj-7Qf3xLm2nVb8cRt4f2a";
const typedAt = (p: number) => KEY.slice(0, Math.floor(p * KEY.length));
const READY = (shown: string): KeyRow => ({ shown, state: "Ready" });
const RESTING = (seconds: number): KeyRow => ({ shown: "sk-…9c1e", state: `Resting, ${seconds} s` });

export const MODELS_INITIAL: ModelsState = { models: [APPLE], keys: [], typing: "", showTiles: false, openProvider: null };

export const MODELS_STEPS: Step<ModelsState>[] = [
  { at: 0, caption: "Settings › AI models. Who answers is up to you.", focus: null, zoom: 1 },
  { at: 1600, focus: "add-model", zoom: 2.2 },
  {
    at: 2300,
    set: { showTiles: true },
    focus: "tiles",
    zoom: 1.5,
    caption:
      "Apple Intelligence on a Mac. Your own key for OpenAI, Gemini or OpenRouter. Or a model on this computer: Ollama, LM Studio, any OpenAI-compatible server.",
  },
  {
    at: 6200,
    set: { showTiles: false, models: [APPLE, OLLAMA], openProvider: "ollama" },
    focus: "ollama-open",
    zoom: 1.9,
    caption: "Local needs no key. Pick from the models Ollama lists; nothing leaves your machine.",
  },
  {
    at: 9400,
    set: { openProvider: "openai", models: [APPLE, OLLAMA, openai("No API key yet", true)] },
    focus: "openai-keys",
    zoom: 1.8,
    caption: "Bring your own keys. They sit in an encrypted store; its master key lives in your keychain.",
  },
  { at: 10600, tween: { dur: 900, apply: (p) => ({ typing: typedAt(p) }) } },
  { at: 11800, set: { typing: "", keys: [READY("sk-…4f2a")], models: [APPLE, OLLAMA, openai("1 key ready")] } },
  {
    at: 12600,
    tween: { dur: 800, apply: (p) => ({ typing: typedAt(p) }) },
    caption: "Add several. Requests take turns across them, so tasks running together go out on different keys.",
  },
  {
    at: 13700,
    set: {
      typing: "",
      keys: [READY("sk-…4f2a"), READY("sk-…9c1e")],
      models: [APPLE, OLLAMA, openai("2 keys ready")],
    },
  },
  { at: 14400, tween: { dur: 800, apply: (p) => ({ typing: typedAt(p) }) } },
  {
    at: 15500,
    set: {
      typing: "",
      keys: [READY("sk-…4f2a"), READY("sk-…9c1e"), READY("sk-…b77d")],
      models: [APPLE, OLLAMA, openai("3 keys ready")],
    },
  },
  {
    at: 17000,
    focus: "key-1",
    zoom: 2.4,
    caption: "A rate-limited key rests and comes back by itself.",
    tween: {
      dur: 3200,
      apply: (p) => ({ keys: [READY("sk-…4f2a"), RESTING(Math.max(1, Math.round(12 - p * 11))), READY("sk-…b77d")] }),
    },
  },
  {
    at: 20600,
    focus: "key-2",
    zoom: 2.4,
    set: {
      keys: [
        { shown: "sk-…4f2a", state: "Ready" },
        { shown: "sk-…9c1e", state: "Ready" },
        { shown: "sk-…b77d", state: "Set aside: invalid key", banned: true },
      ],
      models: [APPLE, OLLAMA, openai("2 keys ready")],
    },
    caption: "One the provider rejects is set aside with the reason, and the rest carry on.",
  },
  { at: 23200, focus: null, zoom: 1, caption: "Room grows with your keys: tasks at once × keys ready." },
];

export const MODELS_DURATION = 25200;
export const OLLAMA_MODELS = ["qwen3", "llama3:8b", "gemma3"];
