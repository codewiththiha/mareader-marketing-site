export interface WordAnswer {
  word: string;
  pos: string;
  level: string;
  meaning: string;
  synonyms: string[];
  usages: string[];
  by: string;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
