export interface Preview {
  id: string;
  chapter: string;
  title: string;
  body: string;
  details: string[];
  imageAlt: string;
  frameLabel: string;
}

export const PREVIEWS: Preview[] = [
  {
    id: "appearance",
    chapter: "Make it yours",
    title: "Limitless themes.",
    body: "Tint it, texture it, add grain. Find a look you love and save it as your own, for PDF and EPUB alike.",
    details: ["Presets & custom colours", "PDF + EPUB"],
    imageAlt: "Mareader's appearance settings beside a sepia-toned book page.",
    frameLabel: "The appearance studio"
  },
  {
    id: "panes",
    chapter: "Make room",
    title: "More books, more room.",
    body: "Read side by side in up to four panes. Keep the same look throughout, or give each pane its own.",
    details: ["Up to four panes", "Per-pane themes"],
    imageAlt: "Four reading panes showing different books, PDFs and page themes.",
    frameLabel: "A space for every book"
  },
  {
    id: "dictionary",
    chapter: "Stay in the story",
    title: "A dictionary that reads the page.",
    body: "Select a word and discover its meaning in context, without breaking the flow. Bring the model you trust.",
    details: ["Context-aware", "Your choice of model"],
    imageAlt: "A contextual dictionary card explaining a selected word in a book.",
    frameLabel: "A little more context"
  },
  {
    id: "models",
    chapter: "Your models, your rules",
    title: "Bring your own model.",
    body: "Use Ollama, LM Studio or Apple's on-device models. Prefer a cloud provider? Bring your own keys and let the rotator handle the rest.",
    details: ["Local models", "Key rotation"],
    imageAlt: "Mareader's AI model settings with local and cloud model providers.",
    frameLabel: "The models you choose"
  },
  {
    id: "voice",
    chapter: "Listen a little longer",
    title: "Read aloud, fully offline.",
    body: "Download a voice once, then listen anywhere. Follow along as Mareader highlights the words for you.",
    details: ["Offline voices", "Read-along highlighting"],
    imageAlt: "A read-aloud player and highlighted words on a book page.",
    frameLabel: "A book, in your ears"
  }
];

export function previewAsset(file: string): string {
  return `${import.meta.env.BASE_URL}demos/${file}`;
}
