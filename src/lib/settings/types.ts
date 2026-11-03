import type { ProviderId } from "@/lib/settings/providers";

export interface ModelRow {
  id: ProviderId;
  name: string;
  note: string;
  warn?: boolean;
  tasks: string[];
}

export interface KeyRow {
  shown: string;
  state: string;
  banned?: boolean;
}

export interface VoiceModel {
  id: string;
  name: string;
  about: string;
  size: string;
  state: "offer" | "downloading" | "ready";
  progress?: number;
  voices?: string;
}
