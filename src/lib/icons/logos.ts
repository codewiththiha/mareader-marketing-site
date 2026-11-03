import apple from "../../assets/logos/apple.svg?raw";
import gemini from "../../assets/logos/gemini.svg?raw";
import lmstudio from "../../assets/logos/lm-studio.svg?raw";
import ollama from "../../assets/logos/ollama.svg?raw";
import openai from "../../assets/logos/openai.svg?raw";
import openrouter from "../../assets/logos/openrouter.svg?raw";

export const LOGOS = { openai, gemini, openrouter, ollama, lmstudio, apple };
export type LogoName = keyof typeof LOGOS;
